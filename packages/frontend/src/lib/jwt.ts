export const LOCAL_STORAGE_JWT = 'jwtToken'

export const getLocalStorageJWT = (): string => {
  return localStorage.getItem(LOCAL_STORAGE_JWT) || ''
}

export const setLocalStorageJWT = (token: string): void => {
  return localStorage.setItem(LOCAL_STORAGE_JWT, token)
}

export const removeLocalStorageJWT = (): void => {
  return localStorage.removeItem(LOCAL_STORAGE_JWT)
}
