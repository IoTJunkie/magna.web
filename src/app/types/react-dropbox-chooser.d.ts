declare module 'react-dropbox-chooser' {
  import * as React from 'react';

  interface DropboxChooserProps {
    // Define the props for the DropboxChooser component
    // based on the library's documentation
    children: JSX.Element;
    appKey: string;
    success: (files: any) => void;
    cancel: () => void;
    linkType?: string[];
    multiselect?: boolean;
    extensions?: string[];
    disabled?: boolean;
    folderselect?: boolean;
  }

  const DropboxChooser: React.ComponentType<DropboxChooserProps>;
  export default DropboxChooser;
}
