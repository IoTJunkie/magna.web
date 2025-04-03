export const imageFileType = ['.jpeg', '.png', '.jpg', '.gif'];

export const pdfFileType = ['.pdf'];

export const docFileType = ['.doc', '.docx', '.odt', '.txt', '.md'];

export const excelFileType = ['.xls', '.xlsm', '.xlsx'];

export const fileTypeAllowUpload = pdfFileType
  .concat(docFileType)
  .concat(imageFileType)
  .concat(excelFileType);

export const urlPreviewDocsFile = 'https://view.officeapps.live.com/op/embed.aspx?src=';

export const mimeTypeAllowUpload = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel.sheet.macroEnabled.12',
];

export const purchasePlanstatus = {
  current: 'Current',
  inprogress: 'In-progress',
  continue: 'Continue Plan',
  upgrade: 'Upgrade',
  contactUs: 'Contact Us',
};
