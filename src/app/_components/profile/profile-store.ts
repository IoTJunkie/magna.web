'use client';
import { IMember } from '@/app/settings/team-management/types';
import { IResource } from '@/app/types/creditInsight';
import { UserProfile } from '@/app/types/userProfile';
import { create } from 'zustand';

type ProfileState = {
  profileInfo: UserProfile | null;
  resourceInfo: IResource | null;
  teamsMember: IMember[] | null;
  documentSizeLimit: number;
};

type ProfileActions = {
  setProfileInfo: (profileInfo: UserProfile) => void;
  setResourceInfo: (profileInfo: IResource) => void;
  setTeamsMember: (teamsMember: IMember[]) => void;
  setDocumentSizeLimit: (documentSizeLimit: number) => void;
};

export const useProfileStore = create<ProfileState & ProfileActions>((set) => ({
  profileInfo: null,
  resourceInfo: null,
  teamsMember: null,
  documentSizeLimit: 0,
  setProfileInfo: (profileInfo) => set({ profileInfo: profileInfo }),
  setResourceInfo: (resourceInfo) => set({ resourceInfo: resourceInfo }),
  setTeamsMember: (teamsMember) => set({ teamsMember: teamsMember }),
  setDocumentSizeLimit: (documentSizeLimit) => set({ documentSizeLimit: documentSizeLimit }),
}));
