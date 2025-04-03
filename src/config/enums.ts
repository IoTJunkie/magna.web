/* eslint-disable no-unused-vars */ //ignore unused vars in this file

// 🔄 Enum for caching strategies
export enum CacheModes {
  DEFAULT = 'default',
  NO_STORE = 'no-store',
  RELOAD = 'reload',
  NO_CACHE = 'no-cache',
  FORCE_CACHE = 'force-cache',
  ONLY_IF_CACHED = 'only-if-cached',
}

export enum ChatItemRoles {
  USER = 'user',
  ASSISTANT = 'assistant',
}

export enum ApiDeleteStatus {
  SUCCCESS = 'SUCCCESS',
  FAILURE = 'FAILURE',
  EXPIRED = 'EXPIRED',
}
