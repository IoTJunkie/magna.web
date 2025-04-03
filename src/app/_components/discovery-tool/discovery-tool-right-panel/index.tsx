'use client';
import { fileTypeAllowUpload } from '@/app/constant';
import useToastComponent from '@/app/hooks/Toast';
import {
  ICaseDocumentUpload,
  ICaseInfo,
  IDiscoveryCaseDocsDetail,
  IItemTree,
} from '@/app/types/discovery';
import { FileDoc } from '@/app/types/fileDoc';
import { generateId, getFileType } from '@/app/utils';
import { isEnoughStorage } from '@/app/utils/checkResourceLeft';
import { validateFile } from '@/app/utils/validation';
import { useSpinner } from '@/contexts/SpinnerContext';
import { Button, Input } from '@fluentui/react-components';
import axios from 'axios';
import classNames from 'classnames';
import _ from 'lodash';
import { getSession } from 'next-auth/react';
import Image from 'next/image';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { parseAsString, useQueryState } from 'nuqs';
import { useEffect, useRef, useState } from 'react';
import BuyMoreResourceDialog from '../../common/BuyMoreResourceDialog';
import CustomIcon from '../../common/CustomIcon';
import DialogError from '../../common/DialogError';
import FileInput from '../../common/FileInput';
import { useChatStore } from '../../conversation/chat/chat-store';
import ArrowBack from '../../icons/arrow-back-icon';
import { useProfileStore } from '../../profile/profile-store';
import DialogPreviewFile from './components/DialogPreviewFile';
import DocumentTree from './components/DocumentTree';

const validFileTypes = fileTypeAllowUpload.join(', ');

type Props = {
  tree: any;
  openItems: string[];
  setOpenItems: (e: string[]) => void;
  interrogativeFileId: string | null;
  isMobile?: boolean;
  setDocuments: (docs: ICaseDocumentUpload[]) => void;
  handleSearchDocsName: (fileName: string) => void;
  docsSelectedByQuestion: string[];
  caseInfo: ICaseInfo;
};

type validateFile = {
  isValid: boolean;
  message?: string;
};

type QuestionFileType = {
  name: string;
  existed: boolean;
  id?: string;
};

const DiscoveryToolRightPanel = (props: Props) => {
  const {
    tree,
    openItems,
    isMobile,
    setDocuments,
    handleSearchDocsName,
    docsSelectedByQuestion,
    caseInfo,
  } = props;
  const [conversationId] = useQueryState('c', parseAsString);
  const { setIsChangeDocumentIds, setDocumentIds, documentIds } = useChatStore();
  const { showSpinner, hideSpinner } = useSpinner();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const caseId = params.id;
  const { resourceInfo, documentSizeLimit } = useProfileStore();
  const searchParams = useSearchParams();
  const isInterrogative = Boolean(searchParams.get('interrogative')) || false;
  const showWarning = resourceInfo?.credits
    ? Number((resourceInfo.credits - resourceInfo?.credit_spent) / resourceInfo.credits) * 100 <= 20
    : false;

  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const [checkedItemsIds, setCheckedItemsIds] = useState<string[]>([]);
  const [questionFile, setQuestionFile] = useState<any>('');
  const [expandAll, setExpandAll] = useState(true);

  const [branchCollapse, setBranchCollapse] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [showBuyMoreResourceDialog, setShowBuyMoreResourceDialog] = useState(false);
  const [draggableItem, setDraggableItem] = useState<QuestionFileType | null>(null);
  const [message, setMessage] = useState<JSX.Element | string | undefined>('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [interrogativeFileId, setInterrogativeFileId] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [linkDoc, setLinkDoc] = useState('');

  const folsTopLevelRef = useRef<string[] | null>(null);
  const documentIdsSession = useRef<string[] | null>(null);
  const dropZoneRef = useRef<any>(null);
  const dropZoneBlurRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const flatTreeRef = useRef<HTMLDivElement | null>(null);
  const topFolderRef = useRef<string[]>([]);

  const { toasterComponent, showToast, setIntent } = useToastComponent({
    content: message || '',
  });

  console.log('tree', tree);

  useEffect(() => {
    if (docsSelectedByQuestion) {
      const filteredData = tree
        .filter((item: any) => docsSelectedByQuestion.includes(item.id))
        .map((item: any) => item.value);
      setCheckedItems(filteredData);
      setCheckedItemsIds(docsSelectedByQuestion);
    }
  }, [docsSelectedByQuestion]);

  useEffect(() => {
    if (props.interrogativeFileId !== null) {
      tree.forEach((item: any) => {
        if (item.id === props.interrogativeFileId) {
          const interrogativeFile = {
            name: item.content,
          };
          setQuestionFile(interrogativeFile);
        }
      });
    }
  }, [props.interrogativeFileId]);

  useEffect(() => {
    if (conversationId) {
      const getCaseDetail = async () => {
        try {
          const session = await getSession();
          let config: any = {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session?.user?.access_token}`,
            },
          };
          const rs = await fetch(
            `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/chats/session/discovery/${conversationId}/`,
            config,
          );
          if (rs.ok) {
            const data: IDiscoveryCaseDocsDetail = await rs.json();
            const ids = data.document_ids || [];
            const filteredData = tree
              .filter((item: any) => ids.includes(item.id))
              .map((item: any) => item.value);
            setCheckedItemsIds(ids);
            setCheckedItems(filteredData);
            setDocumentIds(ids);
            documentIdsSession.current = ids;
          }
        } catch (error) {
          console.log('error :>> ', error);
        }
      };
      getCaseDetail();
    } else {
      setCheckedItemsIds([]);
      setCheckedItems([]);
      setDocumentIds([]);
      documentIdsSession.current = [];
    }
  }, [conversationId]);

  useEffect(() => {
    const stt = _.isEqual((documentIdsSession.current || []).sort(), checkedItemsIds.sort());
    setIsChangeDocumentIds(!stt);
    setDocumentIds(checkedItemsIds);
  }, [checkedItemsIds]);

  useEffect(() => {
    if (tree) {
      const fols = tree
        .filter((item: IItemTree) => {
          if (!item?.parentValue && !item?.isFile) {
            return item.value;
          }
        })
        .map((item: IItemTree) => item.value);
      if (fols) {
        folsTopLevelRef.current = fols;
      }
    }
  }, [tree]);

  const handleDragDiv = (fileName: string, fileId: string) => {
    // event.preventDefault();
    setDraggableItem({ name: fileName, id: fileId, existed: true });
  };

  const showErrorMessage = (message: string) => {
    setIntent('error');
    setMessage(message);
    setIsDragging(false);
    showToast();
  };

  const validateUploadFile = (file: any): validateFile => {
    const fileType = `.${file.name.split('.').pop().toLowerCase()}`;
    const allowedFileTypes = validFileTypes.split(',').map((type) => type.trim());
    if (!allowedFileTypes.includes(fileType.toLocaleLowerCase())) {
      return {
        isValid: false,
        message:
          'Invalid File Format, please upload a folder, PDF, DOC, DOCX, Excel or image file.',
      };
    }
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > documentSizeLimit) {
      return {
        isValid: false,
        message: 'The file size exceeds the limit. Please upload a smaller file.',
      };
    }
    return { isValid: true };
  };

  useEffect(() => {
    const handleDragOver = (event: any) => {
      event.preventDefault();
      setIsDragging(true);
    };

    const dropZoneElement = dropZoneRef.current;
    if (dropZoneElement) {
      dropZoneElement.addEventListener('dragover', handleDragOver);
    }

    return () => {
      if (dropZoneElement) {
        dropZoneElement.removeEventListener('dragover', handleDragOver);
      }
    };
  }, []);

  useEffect(() => {
    const handleDragLeave = (e: any) => {
      e.preventDefault();
      setIsDragging(false);
    };

    const handleDrop = (event: any) => {
      event.preventDefault();
      if (props.interrogativeFileId !== null) {
        setMessage('You have already uploaded interrogative file');
        setShowDialog(true);
        setIsDragging(false);
        return;
      }
      if (draggableItem) {
        setQuestionFile(draggableItem);
        setDraggableItem(null);
      } else {
        const files: FileDoc[] = Array.from(event.dataTransfer.files);
        if (!files.length) {
          setIsDragging(false);
          return;
        }
        const validateResult = validateUploadFile(files[0]);
        if (!validateResult.isValid && validateResult.message) {
          showErrorMessage(validateResult.message);
          return;
        }
        if (files.length < 2) {
          let qFile: any = files[0];
          qFile.existed = false;
          setQuestionFile(qFile);
        } else {
          setShowDialog(true);
        }
      }

      setIsDragging(false);
    };

    const dropZoneElement = dropZoneBlurRef.current;
    if (dropZoneElement) {
      dropZoneElement.addEventListener('dragleave', handleDragLeave);
      dropZoneElement.addEventListener('drop', handleDrop);
    }
    return () => {
      if (dropZoneElement) {
        dropZoneElement.removeEventListener('dragleave', handleDragLeave);
        dropZoneElement.removeEventListener('drop', handleDrop);
      }
    };
  }, [isDragging]);

  const handleTriggerClickEvent = (arr: string[]) => {
    arr.forEach((item) => {
      setTimeout(() => {
        document.getElementById(`id-${item}`)?.click();
      }, 1);
    });
    setTimeout(() => {
      flatTreeRef.current && flatTreeRef.current.scrollTo(0, 0);
    }, arr.length + 1);
  };
  const handleExpandAll = () => {
    const currentSttExpandAll = !expandAll;
    setExpandAll(currentSttExpandAll);
    if (folsTopLevelRef.current && folsTopLevelRef.current.length) {
      if (currentSttExpandAll) {
        handleTriggerClickEvent(branchCollapse);
        topFolderRef.current = [];
        setBranchCollapse([]); //expand all
      } else {
        const fols = _.difference(folsTopLevelRef.current, branchCollapse) || [];
        handleTriggerClickEvent(fols);
        topFolderRef.current = folsTopLevelRef.current;
        setBranchCollapse(folsTopLevelRef.current); // collapse all
      }
    }
  };

  const handleSelectQuestionFile = () => {
    const fileItem = [];
    for (let i = 0; i < checkedItems.length; i++) {
      fileItem.push({ name: checkedItems[i], id: checkedItemsIds[i], existed: true });
    }
    const listFile = fileItem.filter((item) => getFileType(item.name.toLowerCase()) !== 'folder');
    if (listFile.length < 2) {
      setQuestionFile(listFile[0]);
    } else {
      setShowDialog(true);
    }
  };

  const convertToInterrogativeFile = async (session: any, case_id: string, document_id: string) => {
    try {
      showSpinner();
      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/discovery/cases/${case_id}`,
        {
          interrogative_document_id: `${document_id}`,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.user?.access_token}`,
          },
        },
      );
      if (res.status >= 200 && res.status < 300) {
        setIntent('success');
        setMessage('Convert to interrogative file successfully!');
        router.push(`/discovery-tool/${caseId}?interrogative=true`);
      } else {
        setIntent('error');
        setMessage('Only ROG files can be uploaded here. Please try again with a ROG file.');
      }
    } catch (error: any) {
      setIntent('error');
      const msg = error?.response?.data;
      if (msg.length) {
        setMessage(msg[0]);
      } else {
        setMessage('Only ROG files can be uploaded here. Please try again with a ROG file.');
      }
    } finally {
      hideSpinner();
      showToast();
    }
  };

  const handleGetExtractionStatus = async () => {
    try {
      const session = await getSession();
      showSpinner();
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/discovery/cases/${caseId}/extraction-status`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.user?.access_token}`,
          },
        },
      );
      if (res.status >= 200 && res.status < 300) {
        const extractedStatus = res?.data?.extracted;
        if (extractedStatus !== null) {
          convertToInterrogativeFile(session, caseId, interrogativeFileId);
          setIsExtracting(false);
        }
      }
    } catch (error) {
      console.log('error discovery tool upload', error);
    }
  };

  useEffect(() => {
    let intervalId: any = null;
    // loop to call get extracted status
    if (isExtracting) {
      intervalId = setInterval(() => {
        handleGetExtractionStatus();
      }, 3000);
    }

    return () => {
      clearInterval(intervalId);
    };
  }, [isExtracting]);

  const handleUploadQuestionFile = async () => {
    const formData = new FormData();
    const message = validateFile(questionFile);

    if (resourceInfo && !isEnoughStorage(resourceInfo).isEnough) {
      setMessage(isEnoughStorage(resourceInfo).message);
      setShowBuyMoreResourceDialog(true);
      return;
    }

    if (message === 'OK') {
      if (questionFile?.blob) {
        formData.append('files', questionFile.blob, questionFile.name);
      } else {
        formData.append('files', questionFile);
      }
      formData.append(
        'paths',
        questionFile.webkitRelativePath
          ? questionFile.webkitRelativePath
          : questionFile.path
            ? questionFile.path
            : questionFile.name,
      );
    }
    formData.append('title', caseInfo.caseName || '');
    formData.append('case_id', caseId);
    const session = await getSession();
    if (questionFile.existed) {
      convertToInterrogativeFile(session, caseId, questionFile.id);
    } else {
      try {
        showSpinner();
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_ENDPOINT_MEDIA}/discovery_text_extraction`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${session?.user?.access_token}`,
            },
          },
        );
        if (res.status >= 200 && res.status < 300) {
          const doc_id = res.data.tasks[res.data.tasks.length - 1].document_id;
          setInterrogativeFileId(doc_id);
          setIsExtracting(true);
          // setDocuments(res.data.tasks);
        }
      } catch (error) {
        console.log('error discovery tool upload', error);
        setIntent('error');
        setMessage(`${error}`);
        showToast();
        hideSpinner();
      }
    }
  };

  const handleFileInputSelect = () => {
    if (questionFile === '') {
      if (inputRef.current) {
        inputRef.current.click();
      }
    } else {
      if (inputRef.current) {
        inputRef.current.files = null;
        inputRef.current.value = '';
      }
      setQuestionFile('');
    }
  };

  const onSelectFiles = (files: any[]) => {
    const validateResult = validateUploadFile(files[0]);
    if (!validateResult.isValid && validateResult.message) {
      showErrorMessage(validateResult.message);
      return;
    }
    const id = generateId();
    const fileWithId = files.map((file) => {
      const updatedFile = file;
      const { webkitRelativePath, path } = file;
      if (webkitRelativePath !== '' || path) {
        updatedFile['id'] = id;
      } else {
        updatedFile['id'] = generateId();
      }
      updatedFile['existed'] = false;
      return updatedFile;
    });
    setQuestionFile(fileWithId[0]);
  };

  const getLinkDoc = (fileName: string) => {
    tree.forEach((item: any) => {
      if (item.content === fileName && item.isFile === true) {
        setLinkDoc(item.url);
        setShowPreview(true);
      }
    });
  };

  return (
    <div className='mb-4 w-full'>
      <div className='max-w-chat-layout mx-9 mt-12 rounded-t-2xl bg-[#F5F5F5] px-6 py-7'>
        {!isMobile && (
          <>
            <div
              className='flex cursor-pointer items-center justify-between'
              onClick={handleExpandAll}
            >
              <div className='flex items-center gap-4 text-2xl font-medium text-aero-9 md:max-lg:flex-col md:max-lg:items-start'>
                <CustomIcon name='documents-icon' /> Documents
              </div>
              {folsTopLevelRef.current?.length ? (
                <CustomIcon
                  width={20}
                  height={20}
                  name={`${!expandAll ? 'expand-all' : 'collapse-all'}`}
                />
              ) : (
                <></>
              )}
            </div>
            <div className='pb-1'>
              <Input
                placeholder='Search'
                size='large'
                className='mt-6 w-full !p-1 text-base [&_input]:p-0'
                maxLength={254}
                onChange={(e) => handleSearchDocsName(e.target.value)}
                contentBefore={<CustomIcon name='search-icon' />}
              />
            </div>
          </>
        )}
        <DocumentTree
          tree={tree}
          treeRef={flatTreeRef}
          openItems={openItems}
          checkedItems={checkedItems}
          setCheckedItems={setCheckedItems}
          setCheckedItemsIds={setCheckedItemsIds}
          treeHeight={`${showWarning ? 'h-[calc(100vh-41.5rem)]' : 'h-[calc(100vh-37.25rem)]'}`}
          setBranchCollapse={setBranchCollapse}
          setExpandAll={setExpandAll}
          topFolderRef={topFolderRef}
          folsTopLevelRef={folsTopLevelRef}
          handleDragFile={handleDragDiv}
          isDragging={isDragging}
          getLinkDoc={getLinkDoc}
        />
      </div>
      <div className='mx-9 h-[0.0625rem] border-b-4 border-color-screen-stroke'></div>
      <div
        ref={dropZoneRef}
        id='drop-zone'
        className='max-w-chat-layout relative mx-9 h-[18rem] rounded-b-2xl bg-[#EFEFEF] px-6 py-7'
      >
        {isDragging && (
          <div
            ref={dropZoneBlurRef}
            className='absolute flex size-full -translate-x-6 -translate-y-7 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-color-screen-stroke bg-[#d9d9d9]/[.50]'
          >
            <p className='text-sm font-semibold text-support'>Drag your file here</p>
          </div>
        )}
        <div className='flex cursor-pointer items-center justify-between'>
          <div className='flex items-center gap-4 text-2xl font-medium text-aero-9'>
            <CustomIcon name='album-icon' /> ROG File
          </div>
        </div>
        <p className='font-inter mt-[0.25rem] text-xs font-normal italic leading-4 text-neutral-300'>
          Drag and drop from the document tree or upload from your computer.
        </p>
        <div className='my-6 h-[0.0625rem] w-full bg-neutrual-50' />
        {questionFile && (
          <div className='flex flex-row gap-2 rounded-xl bg-color-screen-bg px-4 py-[0.625rem] text-color-text-support'>
            <Image
              src={`/svg/${getFileType(questionFile.name.toLowerCase() || '')}-icon.svg`}
              alt='icon'
              width={16}
              height={20}
              className='!object-cover'
            />
            <span className='max-w-[calc(100%-3.125rem)] truncate'>{questionFile.name}</span>
          </div>
        )}
        <div
          className={classNames('mb-3 mt-5 flex justify-end', {
            hidden: !isInterrogative,
          })}
        >
          <Button
            className='flex h-10 items-center justify-start !px-[1rem] !py-[0.5rem]'
            onClick={() => {
              // router.push(`/discovery-tool/${sessionChat}`);
              router.back();
            }}
          >
            <ArrowBack />
            <h4 className='font-inter ml-[0.375rem] text-[1rem] font-semibold leading-[1.375rem] text-color-text-default'>
              Back to Discovery Pro
            </h4>
          </Button>
        </div>
        <div
          className={classNames(
            'xs:flex-col my-6 flex flex-row justify-end gap-2 md:max-lg:flex-col',
            {
              hidden: isInterrogative,
            },
          )}
        >
          {props.interrogativeFileId === null && (
            <Button
              onClick={handleFileInputSelect}
              appearance='outline'
              size='medium'
              className='!bg-colorNeutralBackground1'
              disabled={props.interrogativeFileId !== null ? true : false}
            >
              <FileInput
                onSelectFiles={onSelectFiles}
                inputRef={inputRef}
                setErrorMessage={() => {}}
                onCancel={() => {}}
                allowMultiple={false}
              />
              {questionFile === '' ? 'Upload' : 'Clear'}
            </Button>
          )}
          {questionFile || props.interrogativeFileId !== null ? (
            <Button
              onClick={() => {
                props.interrogativeFileId !== null
                  ? router.push(`/discovery-tool/${caseId}?interrogative=true`)
                  : questionFile !== ''
                    ? handleUploadQuestionFile()
                    : handleSelectQuestionFile();
              }}
              appearance='primary'
              size='medium'
            >
              Go to Interrogative
            </Button>
          ) : (
            <></>
          )}
        </div>
      </div>
      {toasterComponent}
      {showDialog && (
        <DialogError
          open={showDialog}
          setOpen={() => {}}
          title='One file allowed'
          content='Maximum one file allowed to open Interrogative. Please select one document only.'
          onClose={() => setShowDialog(false)}
        />
      )}
      {showBuyMoreResourceDialog && (
        <BuyMoreResourceDialog
          open={showBuyMoreResourceDialog}
          title='Warning'
          content={message ? message : ''}
          onConfirm={() => router.push('/settings/credit-insight')}
          onCancel={() => setShowBuyMoreResourceDialog(false)}
        />
      )}
      {showPreview && (
        <DialogPreviewFile
          linkDoc={linkDoc}
          open={showPreview}
          onCancel={() => setShowPreview(false)}
        />
      )}
    </div>
  );
};

export default DiscoveryToolRightPanel;

DiscoveryToolRightPanel.displayName = '';
