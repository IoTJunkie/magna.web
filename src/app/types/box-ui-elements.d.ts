declare module 'box-ui-elements/es/elements/content-picker/ContentPicker' {
  export interface ContentPickerProps {
    token: string;
    rootFolderId?: number;
    onChoose?: (e: any) => void;
    chooseButtonLabel?: string;
    logoUrl?: string;
    language?: string;
    renderCustomActionButtons?: DOMElement;
    type?: string;
    // Add other required props for the ContentPicker component
  }

  export default class ContentPicker extends React.Component<ContentPickerProps> {
    // open(): void;
    // close(): void;
    // Add other methods and properties for the ContentPicker component
  }
}
