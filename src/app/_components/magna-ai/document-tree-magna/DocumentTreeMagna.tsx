import { getFileType } from '@/app/utils';
import {
  FlatTree,
  FlatTreeItem,
  TreeItemLayout,
  useHeadlessFlatTree_unstable,
} from '@fluentui/react-components';
import classNames from 'classnames';
import Image from 'next/image';
import CustomIcon from '../../common/CustomIcon';
import styles from './DocumentTreeMagna.module.scss';

type Props = {
  onClick: (v: string) => void;
  tree: any[];
  openItems: string[];
};

const DocumentTreeMagna = ({ onClick, tree, openItems }: Props) => {
  const flatTree = useHeadlessFlatTree_unstable(tree, {
    defaultOpenItems: openItems,
    selectionMode: 'multiselect',
  });

  return (
    <FlatTree {...flatTree.getTreeProps()} aria-label='Selection' className='h-full overflow-auto'>
      {Array.from(flatTree.items(), (flatTreeItem) => {
        const { content, ...treeItemProps } = flatTreeItem.getTreeItemProps();
        return (
          <>
            <FlatTreeItem {...treeItemProps} key={flatTreeItem.value} value={flatTreeItem.value}>
              <TreeItemLayout
                className={classNames(styles.treeItem, {
                  'ml-[-1.5rem]': flatTreeItem.itemType === 'leaf',
                })}
                id={`${flatTreeItem.itemType !== 'leaf' ? `id-${flatTreeItem.value}` : ''}`}
              >
                <div className='mb-2 flex h-10 items-center pt-2'>
                  <div
                    id='dragable-div'
                    draggable
                    className={classNames('flex w-full items-center gap-2', {
                      'rounded-xl bg-color-screen-bg px-4 py-[0.625rem] text-color-text-support':
                        flatTreeItem.itemType === 'leaf',
                    })}
                    onClick={() => {
                      if (flatTreeItem.itemType === 'leaf') {
                        const url = tree.find((item) => item.value === flatTreeItem.value);
                        onClick(url?.url);
                      }
                    }}
                  >
                    {flatTreeItem.itemType === 'leaf' ? (
                      <Image
                        src={`/svg/${getFileType(content?.toLowerCase() || '')}-icon.svg`}
                        alt='icon'
                        width={16}
                        height={20}
                        className='!h-5 w-4 !object-cover'
                      />
                    ) : (
                      <CustomIcon name='folder' width={20} height={20} />
                    )}
                    <span className='max-w-[calc(100%-3.125rem)] truncate text-sm font-semibold '>
                      {content}
                    </span>
                  </div>
                </div>
              </TreeItemLayout>
            </FlatTreeItem>
          </>
        );
      })}
    </FlatTree>
  );
};

export default DocumentTreeMagna;
