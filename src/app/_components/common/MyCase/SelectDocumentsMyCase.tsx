import { filterFilesAllowedMyCase, getFileType } from '@/app/utils';
import classNames from 'classnames';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import CustomIcon from '../CustomIcon';
import { Breadcrumb } from './Breadcrumb';
import { IMycaseFileInfo, IMycaseTreeItem } from '@/config';
import { useMyCaseContext } from '@/contexts/MyCaseContext';

interface IDocsMyCase {
  id: number;
  name: string;
  filename: string;
  path: string;
  description: string;
  assigned_date: string;
  created_at: string;
  updated_at: string;
  self_url: string;
}

interface IProps {
  docs: IDocsMyCase[];
  search: string;
}
const buildTree = (data: IMycaseFileInfo[]): IMycaseTreeItem[] => {
  const root: IMycaseTreeItem[] = [];
  const map: { [key: string]: IMycaseTreeItem } = {};

  data.forEach((item) => {
    const parts = item.path.split('/');
    const isFile = !!item.filename;
    let currentLevel = root;

    parts.forEach((part: any, index: number) => {
      const fullPath = parts.slice(0, index + 1).join('/');

      if (!map[fullPath]) {
        const newItem: IMycaseTreeItem = {
          id: item.id,
          name: item.filename,
          path: fullPath,
          isFile,
          fileName: item.filename,
        };

        map[fullPath] = newItem;

        if (index === parts.length - 1) {
          newItem.isFile = isFile;
        } else {
          newItem.isFile = false;
          newItem.name = part;
          newItem.children = [];
        }

        currentLevel.push(newItem);
      }

      currentLevel = map[fullPath].children || [];
    });
  });

  return root;
};

const findItemById = (items: IMycaseTreeItem[], id: number): IMycaseTreeItem | undefined => {
  for (const item of items) {
    if (item.id === id) {
      return item;
    }
    if (item.children) {
      const found = findItemById(item.children, id);
      if (found) {
        return found;
      }
    }
  }
  return undefined;
};

const SelectDocumentsMyCase = (props: IProps) => {
  const { docs, search } = props;
  const { handleSetDocsSelected, docsSelected } = useMyCaseContext();

  const [docsTree, setDocsTree] = useState<IMycaseTreeItem[]>([]);
  const [breadcrumb, setBreadcrumb] = useState<string[]>([]); // Lưu trữ các bước của breadcrumb
  const sourceTree = useRef<IMycaseTreeItem[]>([]);

  useEffect(() => {
    const tree = buildTree(filterFilesAllowedMyCase(docs));
    sourceTree.current = tree;
    setDocsTree(tree);
  }, [docs]);

  const handleSelectDoc = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    doc: IMycaseTreeItem,
  ) => {
    e.stopPropagation();
    const isFileExisted = docsSelected.some((f: IMycaseTreeItem) => f.id === doc.id);
    if (e.ctrlKey || e.shiftKey || e.metaKey) {
      if (isFileExisted) {
        handleSetDocsSelected(docsSelected.filter((f: IMycaseTreeItem) => f.id !== doc.id));
      } else {
        handleSetDocsSelected([...(docsSelected || []), doc]);
      }
    } else {
      handleSetDocsSelected([doc]);
    }
    // multiple file & sigle folder
    // if (!doc.isFile) {
    //   handleSetDocsSelected([doc]);
    //   return;
    // }
    // const isFileExisted = docsSelected.some((f: IMycaseTreeItem) => f.id === doc.id);
    // if (e.ctrlKey && !haveFolderInDocs(docsSelected)) {
    //   if (isFileExisted) {
    //     handleSetDocsSelected(docsSelected.filter((f: IMycaseTreeItem) => f.id !== doc.id));
    //   } else {
    //     handleSetDocsSelected([...(docsSelected || []), doc]);
    //   }
    // } else {
    //   handleSetDocsSelected(isFileExisted ? [] : [doc]);
    // }
  };

  const handleFolderClick = (path: string, id: number) => {
    handleSetDocsSelected([]);
    const newTree = findItemById(docsTree, id);
    setDocsTree(newTree && newTree?.children ? newTree.children : []);
    setBreadcrumb([...breadcrumb, path.split('/').pop() || '']);
  };

  const handleBreadcrumbClick = (index: number, folderName: string, home?: boolean) => {
    handleSetDocsSelected([]);
    if (home) {
      setDocsTree(sourceTree.current);
      setBreadcrumb([]);
      return;
    }
    const newTree: IMycaseTreeItem | undefined = sourceTree.current.find((item) => {
      return item.name === folderName;
    });
    if (newTree) {
      setDocsTree([newTree]);
      setBreadcrumb(breadcrumb.slice(0, index + 1));
    }
  };

  const checkFileSelected = (fileId: number) => {
    return docsSelected.filter((file: IMycaseTreeItem) => file.id === fileId).length;
  };
  const checkFolderSelected = (fileId: number) => {
    return docsSelected.filter((file: IMycaseTreeItem) => file.id === fileId).length;
  };
  return (
    <>
      <div className='mt-6 flex h-auto w-full flex-wrap gap-4 !border-none text-sm'>
        <Breadcrumb path={breadcrumb} onNavigate={handleBreadcrumbClick} />
        <div className='mt-6 flex h-auto w-full flex-wrap gap-4 !border-none text-sm'>
          {docsTree.length > 0 ? (
            docsTree
              .filter((item) => item.name.toLowerCase().includes(search))
              .map((item) => (
                <div
                  key={item.id}
                  className={classNames(
                    'flex h-auto w-32 cursor-pointer select-none flex-col items-center justify-between gap-2 rounded-lg border border-[#DBDBDE] p-4',
                    {
                      'bg-slate-300': checkFileSelected(item.id) || checkFolderSelected(item.id),
                    },
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    handleSelectDoc(e, item);
                  }}
                  onDoubleClick={(e) => {
                    if (!item.isFile) {
                      e.stopPropagation();
                      e.preventDefault();
                      handleFolderClick(item.path, item.id);
                    }
                  }}
                >
                  {!item.isFile ? (
                    <div>
                      <CustomIcon name='folder-icon' width={45} height={35} className='pt-1' />
                    </div>
                  ) : (
                    <Image
                      src={`/svg/${getFileType(item.fileName || '')}-icon.svg`}
                      alt='icon'
                      width={25}
                      height={34}
                      className='object-none'
                    />
                  )}
                  <span className='max-w-[calc(100%-0.25rem)] truncate text-sm font-semibold'>
                    {item.name}
                  </span>
                </div>
              ))
          ) : (
            <div style={{ marginLeft: '1.25rem' }}>This folder is empty.</div>
          )}
        </div>
      </div>
    </>
  );
};

export default SelectDocumentsMyCase;
