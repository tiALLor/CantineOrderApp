import bcrypt from 'bcrypt'
import config from '@server/config'
import jsonwebtoken from 'jsonwebtoken'
import type { SignOptions, Secret } from 'jsonwebtoken'
import { TRPCError } from '@trpc/server'
import {
  type AuthUserWithRoleName,
  type UserPublic,
} from '@server/entities/user'
import { userRepository } from '@server/repositories/userRepository'
import {
  prepareTokenPayload,
  parseTokenPayload,
  type TokenPayload,
} from '@server/trpc/tokenPayload'
import { assertError } from '@server/utils/errors'
import type { Database } from '@server/database'
import logger from '@server/utils/logger'

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export class AuthService {
  private userRepo

  private refreshTokenKey = config.auth.refreshTokenKey

  private tokenKey = config.auth.tokenKey

  private tokenExpiresIn = config.auth.tokenExpiresIn

  private refreshTokenExpiresIn = config.auth.refreshTokenExpiresIn

  private pepper = config.auth.passwordPepper

  private passwordCost = config.auth.passwordCost

  constructor(db: Database) {
    this.userRepo = userRepository(db)
  }

  // ===========================================
  // signup new user
  // ===========================================
  async signup(
    email: string,
    userName: string,
    password: string,
    roleId: number
  ): Promise<UserPublic> {
    const passwordHash = await this.getPasswordHash(password)

    // check if user exists with email
    const existing = await this.userRepo.getByEmail(email)
    if (existing) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'User with this email already exists',
      })
    }

    const userCreated = await this.userRepo
      .create({
        email,
        name: userName,
        password: passwordHash,
        roleId,
      })
      .catch((error: unknown) => {
        assertError(error)

        // wrapping an ugly error into a user-friendly one
        if (error.message.includes('duplicate key')) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'User with this email already exists',
            cause: error,
          })
        }

        throw error
      })
    return {
      id: userCreated.id,
      name: userCreated.name,
    }
  }

  // ===========================================
  // login
  // ===========================================
  async login(
    email: string,
    password: string
  ): Promise<AuthTokens & { user: AuthUserWithRoleName }> {
    const user = await this.userRepo.getByEmailWithRoleName(email)

    if (!user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Invalid email or password',
      })
    }
    // Verify password
    const isValidPassword = await AuthService.verifyPassword(
      password,
      this.pepper,
      user.password
    )
    if (!isValidPassword) {
      // Log failed login attempt
      logger.warn(`${user.id}: 'invalid_password`)

      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Invalid email or password',
      })
    }

    const authUserWithRoleName: AuthUserWithRoleName = {
      id: user.id,
      name: user.name,
      roleName: user.roleName,
    }

    // Generate tokens
    const tokens = await this.generateTokenPair(authUserWithRoleName)

    return { ...tokens, user: authUserWithRoleName }
  }

  // ===========================================
  // refresh token
  // ===========================================
  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    try {
      // Verify refresh token
      const decoded = jsonwebtoken.verify(refreshToken, this.refreshTokenKey)

      const data = parseTokenPayload(decoded)

      if (data.type !== 'refresh') {
        throw new Error('Invalid refresh token/type')
      }

      // Get user to ensure they still exist and are active
      const user = await this.userRepo.getByIdWithRoleName(data.user.id)
      if (!user) {
        throw new Error('Invalid refresh token/user')
      }

      const authUserWithRoleName: AuthUserWithRoleName = {
        id: user.id,
        name: user.name,
        roleName: user.roleName,
      }

      // Generate tokens
      const newTokens = await this.generateTokenPair(authUserWithRoleName)

      return newTokens
    } catch (error) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Invalid or expired refresh token',
        cause: error,
      })
    }
  }

  // ===========================================
  // change password
  // ===========================================
  async changePassword(
    userId: number,
    oldPassword: string,
    newPassword: string
  ): Promise<UserPublic> {
    // Get user
    const user = await this.userRepo.getById(userId)
    if (!user) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User not found',
      })
    }

    // Verify current password
    const isValidOldPassword = await AuthService.verifyPassword(
      oldPassword,
      this.pepper,
      user.password
    )
    if (!isValidOldPassword) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Old password is incorrect',
      })
    }

    // Hash new password
    const newPasswordHash = await this.getPasswordHash(newPassword)

    const changedUser = await this.userRepo.updatePassword({
      id: userId,
      password: newPasswordHash,
    })
    return changedUser
  }

  // ===========================================
  // remove user
  // ===========================================

  async removeUser(userId: number, password: string): Promise<UserPublic> {
    // Get user
    const user = await this.userRepo.getById(userId)
    if (!user) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User not found',
      })
    }

    // Verify current password
    const isValidPassword = await AuthService.verifyPassword(
      password,
      this.pepper,
      user.password
    )
    if (!isValidPassword) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Password is incorrect',
      })
    }

    const deletedUser = await this.userRepo.deleteUserById(userId)

    if (!deletedUser) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'could not find user with user.id',
      })
    }

    return deletedUser
  }

  // ===========================================
  // TOKEN VERIFICATION
  // ===========================================
  async verifyAccessToken(accessToken: string): Promise<TokenPayload> {
    try {
      // Verify accessToken token
      const decoded = jsonwebtoken.verify(accessToken, this.tokenKey)

      const data = parseTokenPayload(decoded)

      // Get user to ensure they still exist
      const user = await this.userRepo.getById(data.user.id)
      if (!user) {
        throw new Error('Invalid refresh token/user')
      }

      if (data.type !== 'access') {
        throw new Error('Invalid refresh token/type')
      }

      return data
    } catch (error) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Invalid or expired access token',
        cause: error,
      })
    }
  }

  // ===========================================
  // Static functions
  // ===========================================

  async getPasswordHash(
    password: string
    // pepper: string,
    // cost: number
  ): Promise<string> {
    const combined = password + this.pepper
    const hash = await bcrypt.hash(combined, this.passwordCost)
    return hash
  }

  private static async verifyPassword(
    password: string,
    pepper: string,
    hash: string
  ): Promise<boolean> {
    const combined = password + pepper
    return bcrypt.compare(combined, hash)
  }

  private async generateTokenPair(
    userData: AuthUserWithRoleName
  ): Promise<AuthTokens> {
    const accessTokenPayload: TokenPayload = prepareTokenPayload({
      user: { ...userData },
      type: 'access',
    })

    const refreshTokenPayload: TokenPayload = prepareTokenPayload({
      user: { ...userData },
      type: 'refresh',
    })

    const accessTokenOptions: SignOptions = {
      expiresIn: this.tokenExpiresIn as SignOptions['expiresIn'],
    }

    const refreshTokenOptions: SignOptions = {
      expiresIn: this.refreshTokenExpiresIn as SignOptions['expiresIn'],
    }

    const accessToken = jsonwebtoken.sign(
      accessTokenPayload,
      this.tokenKey as Secret,
      accessTokenOptions
    )

    const refreshToken = jsonwebtoken.sign(
      refreshTokenPayload,
      this.refreshTokenKey as Secret,
      refreshTokenOptions
    )

    return { accessToken, refreshToken }
  }
}
