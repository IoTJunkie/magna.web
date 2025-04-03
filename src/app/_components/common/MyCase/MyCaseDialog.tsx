import CustomIcon from '@/app/_components/common/CustomIcon';
import { generateId } from '@/app/utils';
import { validateSizeFileMycase, validateTypeFileMycase } from '@/app/utils/validation';
import { IMycaseTreeItem } from '@/config';
import { useMyCaseContext } from '@/contexts/MyCaseContext';
import { useUploadDocsMagnaContext } from '@/contexts/UploadDocsMagnaContext';
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  Input,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from '@fluentui/react-components';
import axios from 'axios';
import classNames from 'classnames';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { DocumentsMyCase } from './DocumentsMyCase';

interface IProps {
  open: boolean;
  setOpen: (value: boolean) => void;
  setFileSelected: React.Dispatch<React.SetStateAction<any[]>>;
  setShowDialogUploadDocs?: (v: boolean) => void;
  isMagnaPage?: boolean;
}

interface ICaseFull {
  id: number;
  name: string;
  case_number: string;
  description: string;
  case_stage: string;
  status: string;
}

interface ICase {
  id: number;
  case: string;
  number: string;
  caseStage: string;
  firmMember: string;
}

const columns = [
  { columnKey: 'case', label: 'CASE' },
  { columnKey: 'number', label: 'NUMBER' },
  { columnKey: 'caseStage', label: 'CASE STAGE' },
  // { columnKey: 'firmMember', label: 'FIRM MEMBER' },
];

const MyCaseDialog = (props: IProps) => {
  const { open, setOpen, setFileSelected, setShowDialogUploadDocs, isMagnaPage = false } = props;
  const { myCaseAccessToken, docsSelected, handleSetDocsSelected, onSetMyCaseAccessToken } =
    useMyCaseContext();
  const { onSetIsPreviewScreen } = useUploadDocsMagnaContext();

  const [caseId, setCaseId] = useState<number | null>(null);
  const [cases, setCases] = useState<ICase[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [search, setSearch] = useState<string>('');
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const getToken = async () => {
    try {
      setLoading(true);
      const url = '/api/mycase/cases';
      const rs = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${myCaseAccessToken}`,
        },
      });
      if (rs?.data?.errors) {
        // TOKEN expired or invalid
        onSetMyCaseAccessToken(null);
        setOpen(false);
        setShowDialogUploadDocs && setShowDialogUploadDocs(true);
      } else if (rs?.data?.message) {
        setErrMsg(rs?.data?.message);
      } else if (rs?.data) {
        const data = rs;
        const ls = data?.data.map((item: ICaseFull) => {
          return {
            id: item.id,
            case: item.name,
            number: item.case_number,
            caseStage: item.case_stage,
            // firmMember: 'firmMember',
          };
        });
        setCases(ls as ICase[]);
      }
    } catch (error) {
      console.log('error', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (myCaseAccessToken) {
      getToken();
    }
  }, [myCaseAccessToken]);

  const uploadFile = async (item: IMycaseTreeItem, folId: string | null) => {
    try {
      const url = '/api/mycase/downloads';
      const response: any = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${myCaseAccessToken}`,
          param: item.id,
        },
        responseType: 'blob',
      });

      if (response?.data && validateSizeFileMycase(response?.data?.size)) {
        const file = {
          webkitRelativePath: folId ? item.path : '', //check is folder
          name: item.name,
          size: response.data?.size,
          blob: response.data,
          isFileCloudStorage: true,
          id: folId ? folId : item.id,
        };
        setFileSelected((prev) => [...prev, file]);
      }
    } catch (error) {
      console.log('error', error);
    }
  };

  const findAllFiles = (items: IMycaseTreeItem[]): IMycaseTreeItem[] => {
    let result: IMycaseTreeItem[] = [];
    for (const item of items) {
      if (item.isFile) {
        result.push(item);
      }
      if (item.children) {
        result = result.concat(findAllFiles(item.children));
      }
    }
    return result;
  };

  const handleSelect = async () => {
    const ls = findAllFiles(docsSelected);
    // const isFol = docsSelected.some((item) => !item.isFile);
    if (ls.length) {
      setDownloadLoading(true);
      const id = generateId();
      await Promise.all(
        ls.map(async (item: IMycaseTreeItem) => {
          const msg = validateTypeFileMycase(item.fileName);
          if (msg) {
            await uploadFile(item, item.path.includes('/') ? id : null); //id folder khac nhau
          }
        }),
      );
      setDownloadLoading(false);
      onSetIsPreviewScreen(true);
      handleSetDocsSelected([]);
      setShowDialogUploadDocs && setShowDialogUploadDocs(isMagnaPage);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} modalType='alert'>
      <DialogSurface className='w-auto !max-w-[58.5rem] !p-0'>
        <DialogBody>
          <DialogTitle className='flex items-center justify-between px-9 pb-5 pt-6'>
            <div className='flex items-center justify-center gap-4'>
              <Image alt='' src='/svg/mycase-logo.svg' width={48} height={48} />
              <div className='text-2xl font-medium'>Select a case</div>
            </div>
          </DialogTitle>
          <DialogContent className='!text-support'>
            <div className='border-y px-9 py-6'>
              <div>
                <Input
                  placeholder='Search'
                  size='large'
                  className='mb-0 w-full !text-sm [&_input]:p-0'
                  maxLength={254}
                  onChange={(e) => setSearch(e.target.value)}
                  contentBefore={<CustomIcon name='search-icon' />}
                  defaultValue={search}
                />
              </div>
              <div className='flex items-center justify-between pt-9'>
                {caseId ? (
                  <>
                    <div className='text-2xl font-medium'>All Files</div>
                    <div
                      className='cursor-pointer'
                      onClick={() => {
                        handleSetDocsSelected([]);
                        setCaseId(null);
                        setSearch('');
                      }}
                    >
                      {'<-'}
                    </div>
                  </>
                ) : (
                  <div className='mb-6 text-2xl font-medium'>All Case</div>
                )}
              </div>

              {caseId ? (
                <>
                  {/* Document list */}
                  <DocumentsMyCase caseId={caseId} search={search} />
                </>
              ) : loading ? (
                <div className='flex h-full grow items-center justify-center'>
                  <Spinner size='small' />
                </div>
              ) : errMsg ? (
                <>{errMsg}</>
              ) : (
                <div className='h-[40vh] overflow-auto'>
                  <Table arial-label='Default table' sortable>
                    <TableHeader className='sticky top-0 !z-50 !bg-neutrual-900-2 text-sm text-neutrual-900 [&_*]:!font-bold [&_th]:p-3 '>
                      <TableRow>
                        {columns.map((column) => (
                          <TableHeaderCell
                            key={column.columnKey}
                            className='!h-10 text-sm !font-semibold'
                          >
                            {column.label}
                          </TableHeaderCell>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cases
                        .filter((item) => item.case.toLowerCase().includes(search))
                        .map((item, idx) => (
                          <TableRow
                            key={item.id}
                            className={classNames(
                              'z-10 h-10 cursor-pointer !border-none [&_td]:!px-3 [&_td]:text-primary',
                              {
                                'bg-table-even-row': idx % 2 !== 0,
                              },
                            )}
                            onClick={() => {
                              setSearch('');
                              setCaseId(item.id);
                            }}
                          >
                            <TableCell>{item.case}</TableCell>
                            <TableCell>{item.number}</TableCell>
                            <TableCell>{item.caseStage}</TableCell>
                            {/* <TableCell>{item.firmMember}</TableCell> */}
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
            <div className='flex gap-2 px-9 py-6'>
              <Button
                className={classNames(
                  'flex gap-2 !bg-aero-7 !text-base !font-semibold !text-confirm',
                  {
                    '!cursor-not-allowed opacity-70': !docsSelected.length,
                  },
                )}
                size='medium'
                onClick={handleSelect}
              >
                {downloadLoading && <Spinner size='tiny' />}
                Select
              </Button>
              <Button
                size='medium'
                onClick={() => {
                  handleSetDocsSelected([]);
                  setOpen(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </DialogContent>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};

export default MyCaseDialog;
