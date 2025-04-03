import { ThemeTypes } from '@/app/utils/multipleThemes';
import { useThemeContext } from '@/contexts/ThemeContext';
import { Button, Popover, PopoverSurface, PopoverTrigger, useId } from '@fluentui/react-components';
import PopOverMenu from './PopOverMenu';
import UploadOption from './UploadOption';

interface PopsOverProps {
  onSelectFiles: (files: File[]) => void;
  setErrorMessage: (newMessage: string) => void;
  onCancel: () => void;
  isMagna?: boolean;
  onShowErr?: (v: string, s?: boolean) => void;
}

const PopsOverDevice = ({
  onSelectFiles,
  setErrorMessage,
  onCancel,
  isMagna = false,
  onShowErr,
}: PopsOverProps) => {
  const id = useId();
  const { theme } = useThemeContext();
  const src = theme === ThemeTypes.DARK ? '/svg/pc-dark-logo-icon.svg' : '/svg/pc-logo-icon.svg';

  return (
    <Popover trapFocus>
      <PopoverTrigger>
        <Button style={{ all: 'unset' }}>
          <UploadOption title='Personal Device' img_url={src} />
        </Button>
      </PopoverTrigger>
      <PopoverSurface aria-labelledby={id}>
        <PopOverMenu
          onSelectFiles={onSelectFiles}
          setErrorMessage={setErrorMessage}
          onCancel={onCancel}
          isMagna={isMagna}
          onShowErr={onShowErr}
        />
      </PopoverSurface>
    </Popover>
  );
};

export default PopsOverDevice;
