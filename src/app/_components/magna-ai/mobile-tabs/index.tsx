'use client';
import Chat from '@/app/_components/conversation/chat';
import { ITreeItem } from '@/app/types/documentsUpload';
import { FileDoc } from '@/app/types/fileDoc';
import { generateDocumentTree } from '@/app/utils';
import {
  Button,
  SelectTabData,
  SelectTabEvent,
  Spinner,
  Tab,
  TabList,
  TabValue,
} from '@fluentui/react-components';
import _ from 'lodash';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useWindowSize } from 'usehooks-ts';
import useChat from '../../conversation/chat/useChat';
import DocumentTreeMagna from '../document-tree-magna/DocumentTreeMagna';
import MagnaFilePreview from '../magna-file-preview';

interface IMagnaMobileTabs {
  linkDocs: FileDoc[];
}

export const MagnaMobileTabs = ({ linkDocs }: IMagnaMobileTabs) => {
  const [selectedValue, setSelectedValue] = useState<TabValue>('tab1');
  const [openPreviewFile, setOpenPreviewFile] = useState<boolean>(false);
  const [summarizing, setSummarizing] = useState<boolean>(false);
  const [linkDoc, setLinkDoc] = useState<string>('');
  const [tree, setTree] = useState<any[]>([]); //ITreeItem[]
  const [openItems, setOpenItems] = useState<string[] | null>(null);

  const windowSize = useWindowSize();
  const isMobile = windowSize.width < 640;

  const { appendTextChat } = useChat();

  const textChatSummaryDocsFile = 'Write a letter summarizing the uploaded document to my client.';

  const onTabSelect = (event: SelectTabEvent, data: SelectTabData) => {
    setSelectedValue(data.value);
  };

  const handleGetTree = (docs: FileDoc[]) => {
    const folderTree: ITreeItem[] = _.uniqBy(generateDocumentTree(docs), 'value') || [];
    const values = folderTree.map((item: any) => item.value) || [];
    setOpenItems(values);
    setTree(folderTree);
  };

  useEffect(() => {
    if (linkDocs) {
      handleGetTree(linkDocs);
      setLinkDoc(linkDocs[0]?.url || '');
    }
  }, [linkDocs]);

  const onAppendSummarize = async () => {
    try {
      setSummarizing(true);
      setSelectedValue('tab1');
      await appendTextChat(textChatSummaryDocsFile);
    } catch (error) {
    } finally {
      setSummarizing(false);
    }
  };

  const onClickChangeDocPreview = (v: string) => {
    setLinkDoc(v);
    setOpenPreviewFile(true);
  };

  return (
    <div className='flex h-full flex-col md:hidden'>
      <TabList
        defaultSelectedValue='tab1'
        selectedValue={selectedValue}
        onTabSelect={onTabSelect}
        className='flex max-w-full shrink overflow-x-auto px-4 py-5'
      >
        <Tab value='tab1'>AI Chat</Tab>
        <Tab value='tab2'>Uploaded Files</Tab>
      </TabList>

      <div className='flex size-full flex-1 flex-col md:hidden'>
        {selectedValue === 'tab1' && <Chat />}
        {selectedValue === 'tab2' && linkDocs && (
          <div>
            <div className='mx-[1.25rem] bg-[#FFFDE7]'>
              <div className='px-[0.5rem] py-[1rem]'>
                {/* {linkDocs?.map((doc, i) => {
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
                      isDocExpand={false}
                      onClick={() => {
                        setLinkDoc(doc?.url);
                        setOpenPreviewFile(true);
                      }}
                    />
                  );
                })} */}
                {openItems && (
                  <DocumentTreeMagna
                    onClick={onClickChangeDocPreview}
                    tree={tree}
                    openItems={openItems}
                  />
                )}
              </div>
            </div>
            <div className='mt-4 flex w-full justify-center'>
              <Button
                appearance='primary'
                size='large'
                onClick={onAppendSummarize}
                disabled={summarizing}
              >
                {summarizing ? (
                  <Spinner size='tiny' className='mr-2' />
                ) : (
                  <Image src='/svg/summarize.svg' alt='' width={20} height={20} className='mr-2' />
                )}
                {summarizing ? 'Summarizing' : 'Summarize'}
              </Button>
            </div>
            {openPreviewFile && linkDoc && isMobile && (
              <MagnaFilePreview
                open={openPreviewFile}
                linkDoc={linkDoc}
                onClose={() => {
                  setOpenPreviewFile(false);
                  setLinkDoc('');
                }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
