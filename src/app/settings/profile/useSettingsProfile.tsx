import { useProfileStore } from '@/app/_components/profile/profile-store';
import { PlansName } from '@/config';

export default function useSettingsProfile() {
  const { setProfileInfo, profileInfo } = useProfileStore();
  const changeSttOcr = async (stt: boolean) => {
    const params = { active_ocr_support: stt };
    const response = await fetch('/api/plg/accounts/profile/', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const rs = await response.json();
    if (rs) {
      setProfileInfo(rs);
    }
  };
  const ocrRequired =
    profileInfo?.current_subscription?.subscription_plan?.name === PlansName.Plus &&
    !profileInfo?.active_ocr_support;

  return {
    changeSttOcr,
    ocrRequired,
  };
}
