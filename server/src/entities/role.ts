// data in table 'role' are intended to be accessible only from administrator with direct access
// separate table for 'role' value is used for better scalability by possible future functionality expansion

export const ROLES = ['admin', 'chef', 'user'] as const

export type Role = (typeof ROLES)[number]
