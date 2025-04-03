import CustomIcon from '@/app/_components/common/CustomIcon';
import { IItemTree } from '@/app/types/discovery';
import { getFileType, handleUpdateArray } from '@/app/utils';
import {
  FlatTree,
  FlatTreeItem,
  TreeCheckedChangeData,
  TreeItemLayout,
  useHeadlessFlatTree_unstable,
} from '@fluentui/react-components';
import classNames from 'classnames';
import { uniq } from 'lodash';
import Image from 'next/image';
import React, { ChangeEvent, MutableRefObject } from 'react';
import styles from './DocumentTree.module.scss';

type Props = {
  tree: any; // IItemTree[]
  treeRef: MutableRefObject<HTMLDivElement | null>;
  openItems: string[]; // default all expanded items
  checkedItems: string[]; // ex: ['fol','fol-file1.doc']
  setCheckedItems: React.Dispatch<React.SetStateAction<string[]>>; // item checked includes file and folder
  setCheckedItemsIds: React.Dispatch<React.SetStateAction<string[]>>; // Ids of files
  setBranchCollapse: React.Dispatch<React.SetStateAction<string[]>>; // handle expand/collapse all
  setExpandAll: (v: boolean) => void; // status expand all
  treeHeight?: string; // custom folder tree height
  topFolderRef: MutableRefObject<string[]>; // status folders level 1 expand/collapse
  folsTopLevelRef: MutableRefObject<string[] | null>; // folders level 1
  handleDragFile?: (fileName: string, fileId: string) => void; //event drag file for upload ROG file
  isDragging?: boolean; // stt event drag
  isMobile?: boolean;
  getLinkDoc: (v: string) => void; //
};

const DocumentTree = ({
  tree,
  treeHeight,
  openItems,
  checkedItems,
  setCheckedItems,
  setCheckedItemsIds,
  setBranchCollapse,
  setExpandAll,
  treeRef,
  topFolderRef,
  folsTopLevelRef,
  handleDragFile,
  isDragging = false,
  isMobile = false,
  getLinkDoc,
}: Props) => {
  const flatTree = useHeadlessFlatTree_unstable(tree, {
    defaultOpenItems: openItems,
    selectionMode: 'multiselect',
  });
  let parentFolderLength: number;

  const handleUncheckedItem = (value: string, values: string[], ids: string[]) => {
    const parentNode = tree.find((item: IItemTree) => item.value === value);
    if (!parentNode?.parentValue) {
      setCheckedItems((prev: string[]) => prev.filter((item: string) => !values.includes(item)));
    } else {
      const childrenOfSameLevel = tree.filter(
        (item: IItemTree) => item.parentValue === parentNode.parentValue && item.value !== value,
      );

      const childrenValues = childrenOfSameLevel.map((item: IItemTree) => item.value);
      const isEmptyFolder = checkedItems.some((item) => childrenValues.includes(item));

      if (isEmptyFolder) {
        setCheckedItems((prev) =>
          prev.filter((item: string) => !values.includes(item) && !ids.includes(item)),
        );
      } else {
        setCheckedItems((prev: string[]) =>
          prev.filter(
            (item: string) =>
              ![parentNode.parentValue, value, ...values].includes(item) && !ids.includes(item),
          ),
        );
        handleUncheckedItem(parentNode.parentValue, values, ids);
      }

      tree.forEach((item: IItemTree) => {
        if (
          item.value.startsWith(`${value}-`) ||
          (item.value.startsWith(`${value}`) && item.isFile)
        ) {
          values.push(item.value);
          if (item.isFile) {
            ids.push(item.id);
          }
        } else if (!item.parentValue && item.isFile) {
          ids.push(item.id);
        }
      });
    }
  };
  const containsAll = (a: string[], b: string[]) => {
    const aSet = new Set(a);
    for (const element of b) {
      if (!aSet.has(element)) {
        return false;
      }
    }
    return true;
  };
  const handleCheckedItem = (value: string, values: string[]) => {
    const parentNode = tree.find((item: IItemTree) => item.value === value);
    if (!parentNode?.parentValue) {
      setCheckedItems((prev: string[]) => {
        return uniq([...prev, ...values]);
      });
    } else {
      const childrenOfSameLevel = tree.filter(
        (item: IItemTree) => item.parentValue === parentNode.parentValue,
      );

      const childrenValues = childrenOfSameLevel.map((item: IItemTree) => item.value);
      const isSelectedAllChildrent = containsAll([value, ...checkedItems], childrenValues);
      if (isSelectedAllChildrent) {
        setCheckedItems((prev: string[]) => {
          return uniq([...prev, ...values, parentNode?.parentValue]);
        });
        handleCheckedItem(parentNode?.parentValue, values);
      } else {
        setCheckedItems((prev: string[]) => {
          return uniq([...prev, ...values]);
        });
      }
      setCheckedItems((prev: string[]) => {
        return uniq([...prev, ...values]);
      });
    }
  };
  const onCheckedChange = (event: ChangeEvent<HTMLInputElement>, data: TreeCheckedChangeData) => {
    const value = data?.value?.toString();
    if (value) {
      const checked = event.target?.checked;
      let ids: string[] = [];
      let values: string[] = [value];
      tree.map((item: IItemTree) => {
        if (
          item.value.startsWith(`${value}-`) ||
          (item.value.startsWith(`${value}`) && item.isFile) // case checked file
        ) {
          values.push(item.value);
          if (item.isFile) {
            ids.push(item.id);
          }
        } else if (!item.parentValue && item.isFile && value === item.value) {
          ids.push(item.id);
        }
      });
      if (checked) {
        handleCheckedItem(value, values);
        setCheckedItemsIds((prev: string[]) => {
          return uniq([...prev, ...ids]);
        });
      } else {
        handleUncheckedItem(value, values, ids);
        setCheckedItemsIds((prev: string[]) => {
          const arr = prev.filter((item: string) => !ids.includes(item));
          return uniq(arr);
        });
      }
    }
  };

  const onClickBranch = (v: string, isTopFolder: boolean) => {
    setBranchCollapse((prev) => {
      const newBranchCollapse = handleUpdateArray(v, prev);
      return newBranchCollapse;
    });
    if (isTopFolder) {
      const newArrTopFolder = handleUpdateArray(v, topFolderRef.current);
      topFolderRef.current = newArrTopFolder;
      if (newArrTopFolder.length === 0) {
        setExpandAll(true);
      } else if (
        folsTopLevelRef.current &&
        newArrTopFolder.length === folsTopLevelRef.current.length
      ) {
        setExpandAll(false);
      }
    }
  };

  return (
    <FlatTree
      {...flatTree.getTreeProps()}
      aria-label='Selection'
      checkedItems={checkedItems}
      onCheckedChange={onCheckedChange}
      className={`${treeHeight ? treeHeight : 'h-full'} overflow-auto`}
      ref={treeRef}
    >
      {Array.from(flatTree.items(), (flatTreeItem) => {
        const { content, id, ...treeItemProps } = flatTreeItem.getTreeItemProps();
        if (flatTreeItem?.childrenValues.length > 0) {
          parentFolderLength = flatTreeItem.childrenValues.length;
        }
        return (
          <>
            {!isMobile && flatTreeItem.level === 1 ? (
              <div className='my-6'>
                <div className='h-[0.0625rem] w-full bg-neutrual-50' />
              </div>
            ) : (
              <></>
            )}

            <FlatTreeItem {...treeItemProps} key={flatTreeItem.value} value={flatTreeItem.value}>
              <TreeItemLayout
                className={classNames(styles.treeItem, {
                  'ml-[-1.5rem]': flatTreeItem.itemType === 'leaf',
                })}
                id={`${flatTreeItem.itemType !== 'leaf' ? `id-${flatTreeItem.value}` : ''}`}
              >
                <div
                  className='flex h-8'
                  onClick={() => {
                    const isTopFolder =
                      flatTreeItem?.itemType === 'branch' && flatTreeItem?.level === 1;
                    onClickBranch(flatTreeItem.value as string, isTopFolder);
                  }}
                >
                  <div
                    id='dragable-div'
                    draggable
                    onDrag={() => {
                      handleDragFile && handleDragFile(content ? content : '', id ? id : '');
                    }}
                    className={classNames('flex w-full items-center gap-2', {
                      'rounded-xl bg-color-screen-bg px-4 py-[0.625rem] text-color-text-support':
                        flatTreeItem.itemType === 'leaf',
                      'z-50': isDragging,
                    })}
                    onClick={() => getLinkDoc(content ? content : '')}
                  >
                    {flatTreeItem.itemType === 'leaf' ? (
                      <Image
                        src={`/svg/${getFileType(content?.toLowerCase() || '')}-icon.svg`}
                        alt='icon'
                        width={16}
                        height={20}
                        className='!object-cover'
                      />
                    ) : (
                      <CustomIcon name='folder' width={20} height={20} />
                    )}
                    <span className='max-w-[calc(100%-3.125rem)] truncate'>{content}</span>
                  </div>
                </div>
              </TreeItemLayout>
            </FlatTreeItem>
            {isMobile && flatTreeItem?.position === parentFolderLength ? (
              <div className='my-6 h-[0.0625rem] w-full bg-neutrual-50' />
            ) : (
              <></>
            )}
          </>
        );
      })}
    </FlatTree>
  );
};

export default DocumentTree;
