import { IResource, IResourceLeftChecking } from '../types/creditInsight';

export const isEnoughStorage = (
  resource: IResource,
  totalFileSize?: number,
): IResourceLeftChecking => {
  if (resource.storage_limit - resource.storage_spent === 0) {
    return {
      isEnough: false,
      message: 'Your Storage have run out. Consider exchange more to ensure continued use.',
    };
  }
  if (totalFileSize && totalFileSize > resource.storage_limit - resource.storage_spent) {
    return {
      isEnough: false,
      message: 'Your Storage are insufficient. Please redeem more to continue usage.',
    };
  }
  return { isEnough: true };
};
