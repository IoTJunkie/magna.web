import { imageFileType, pdfFileType, urlPreviewDocsFile } from '@/app/constant';
import { ITreeItem } from '@/app/types/documentsUpload';
import { FileDoc } from '@/app/types/fileDoc';
import { generateDocumentTree } from '@/app/utils';
import { Button, Spinner } from '@fluentui/react-components';
import axios from 'axios';
import classNames from 'classnames';
import _ from 'lodash';
import Image from 'next/image';
import React, { useEffect, useRef, useState } from 'react';
import useChat from '../conversation/chat/useChat';
import DocumentTreeMagna from '../magna-ai/document-tree-magna/DocumentTreeMagna';
import CustomIcon from './CustomIcon';
import FileBox from './FileBox';
import { parseAsString, useQueryState } from 'nuqs';
import { useChatStore } from '../conversation/chat/chat-store';

type Props = {
  linkDocs: FileDoc[];
  expandDocs: boolean;
  onSetExpandDocs: (e: boolean) => void;
  isMobile?: boolean;
  docsTree?: boolean;
};

const PreviewFile = (props: Props) => {
  const { linkDocs, expandDocs, onSetExpandDocs, isMobile = false, docsTree = false } = props;
  const [conversationId] = useQueryState('c', parseAsString);
  const { idsSharedSessionChat } = useChatStore();

  const imageRef = useRef<HTMLImageElement>(null);
  const [scale, setScale] = useState<number>(1);
  const [summarizing, setSummarizing] = useState<boolean>(false);
  const { appendTextChat } = useChat();
  const [linkDoc, setLinkDoc] = useState('');
  const [textChatSummaryDocsFile, setTextChatSummaryDocsFile] = useState('');
  const [tree, setTree] = useState<any[]>([]); //ITreeItem[]
  const [openItems, setOpenItems] = useState<string[] | null>(null);
  const refSttLinkValid = useRef(false);

  const [isReadOnlySessionChat, setIsReadOnlySessionChat] = useState(false);

  useEffect(() => {
    const getSummarizeyQuestion = async () => {
      const url = '/api/plg/chats/helpful-questions/general/';
      const response = await axios.get(url);
      if (response.data && response.data.length) {
        setTextChatSummaryDocsFile(response.data[0]?.answer);
      }
    };
    getSummarizeyQuestion();
  }, []);

  useEffect(() => {
    if (conversationId) {
      setIsReadOnlySessionChat(idsSharedSessionChat.includes(conversationId));
    }
  }, [idsSharedSessionChat, conversationId]);

  const handleGetTree = (docs: FileDoc[]) => {
    const folderTree: ITreeItem[] = _.uniqBy(generateDocumentTree(docs), 'value') || [];
    const values = folderTree.map((item: any) => item.value) || [];
    setOpenItems(values);
    setTree(folderTree);
  };

  useEffect(() => {
    if (docsTree) {
      handleGetTree(linkDocs);
    }
  }, [linkDocs, docsTree]);

  useEffect(() => {
    if (linkDocs.length > 0) {
      const checkInvalidUrl = !linkDocs[0]?.url || linkDocs[0]?.url.includes('//localhost:');
      if (conversationId && !checkInvalidUrl && !refSttLinkValid.current) {
        setLinkDoc(linkDocs[0]?.url || '');
        refSttLinkValid.current = true;
      }
    }
  }, [conversationId, linkDocs]);

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    const delta = event.deltaY;
    const zoomStep = 0.1;
    if (delta > 0) {
      // Zoom out
      setScale((prevScale) => Math.max(prevScale - zoomStep, 0.1));
    } else {
      // Zoom in
      setScale((prevScale) => Math.min(prevScale + zoomStep, 3));
    }
  };

  const getFIleTypeFromLinkUpload = (val: string) => {
    const splitStr = val.split('.');
    return splitStr[splitStr.length - 1];
  };

  const fileType = getFIleTypeFromLinkUpload(linkDoc as string).toLowerCase();

  const showIframe = () => {
    console.log('linkDoc', linkDoc);
    if (imageFileType.includes(`.${fileType}`)) {
      return (
        <div
          style={{ overflow: 'hidden', width: '100%', maxHeight: 'calc(100vh - 11rem)' }}
          onWheel={handleWheel}
        >
          <img src={linkDoc} alt='' style={{ transform: `scale(${scale})` }} ref={imageRef} />
        </div>
      );
    }
    if (pdfFileType.includes(`.${fileType}`)) {
      return (
        <iframe src={linkDoc} style={{ width: '100%', height: '100%' }}>
          Your browser does not support iframes.
        </iframe>
      );
    }
    return (
      <iframe
        src={`${urlPreviewDocsFile}${encodeURIComponent(`${linkDoc}`)}&embedded=true`}
        style={{ width: '100%', height: '100%' }}
      >
        Your browser does not support iframes.
      </iframe>
    );
  };

  const onAppendSummarize = async () => {
    try {
      setSummarizing(true);
      await appendTextChat(textChatSummaryDocsFile);
    } catch (error) {
    } finally {
      setSummarizing(false);
    }
  };

  const handleExpand = () => {
    onSetExpandDocs(!expandDocs);
  };

  if (isMobile) {
    return (
      <div className='flex h-full flex-1 flex-col bg-drover-1 p-2'>
        <div className='flex-1 bg-slate-400'>{showIframe()}</div>
      </div>
    );
  }

  const onClickChangeDocPreview = (v: string) => {
    setLinkDoc(v);
  };

  return (
    <div
      className={classNames('flex h-full flex-1 flex-col bg-drover-1 p-5 px-6', {
        'float-right w-4/5': expandDocs,
      })}
    >
      <div className='flex items-center justify-between'>
        <div className='flex flex-wrap items-center'>
          <CustomIcon name='uploaded-file' className='mr-4' />
          <h4 className='font-heading text-2xl font-medium text-drover-9'>Uploaded file</h4>
        </div>
        <button
          onClick={handleExpand}
          className='flex w-fit flex-wrap items-center justify-center gap-2 rounded border border-aero-10 px-2 py-1 text-base font-semibold text-[64646C]'
        >
          <CustomIcon name={`${expandDocs ? 'collapse-file' : 'expand-file'}`} />
          {expandDocs ? 'Collapse file' : 'Expand file'}
        </button>
      </div>
      <div
        className={classNames(
          'my-[1.25rem] max-h-[10vh] min-h-[9rem] overflow-y-auto pr-[0.625rem]',
          // 'my-[1.25rem] max-h-[12.2rem] min-h-[9rem] overflow-y-auto pr-[0.625rem]',
          {
            'flex h-[6.25rem] flex-wrap justify-between': expandDocs,
            'flex flex-col': !expandDocs,
          },
        )}
      >
        {docsTree && openItems ? (
          <div className='w-full'>
            <DocumentTreeMagna
              onClick={onClickChangeDocPreview}
              tree={tree}
              openItems={openItems}
            />
          </div>
        ) : (
          linkDocs?.map((doc, i) => {
            const getFileNameFromLinkUpload = (val: string) => {
              return val.split('/').slice(-1)[0];
            };

            const fileName = getFileNameFromLinkUpload(doc?.name);

            return (
              <FileBox
                isOnlyOneDoc={linkDocs.length === 1}
                isActive={doc?.url === linkDoc}
                key={i}
                fileName={fileName}
                isDocExpand={expandDocs}
                onClick={() => setLinkDoc(doc?.url || '')}
              />
            );
          })
        )}
      </div>
      <div className='mt-4'>
        <Button
          appearance='primary'
          size='large'
          onClick={onAppendSummarize}
          disabled={summarizing || isReadOnlySessionChat}
        >
          {summarizing ? (
            <Spinner size='tiny' className='mr-2' />
          ) : (
            <Image src='/svg/summarize.svg' alt='' width={20} height={20} className='mr-2' />
          )}
          {summarizing ? 'Summarizing' : 'Summarize'}
        </Button>
      </div>
      <div className='mt-8 flex-1 bg-slate-400'>
        {linkDoc ? (
          showIframe()
        ) : (
          <div className='flex h-full items-center justify-center text-drover-9'>
            No file to preview
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(PreviewFile);
