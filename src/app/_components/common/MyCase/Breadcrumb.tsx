type BreadcrumbProps = {
  path: string[];
  onNavigate: (index: number, folderName: string, home?: boolean) => void;
};

export const Breadcrumb = ({ path, onNavigate }: BreadcrumbProps) => {
  return (
    <div className='mb-2 flex gap-1'>
      {path.length ? (
        <div className='cursor-pointer' onClick={() => onNavigate(0, '', true)}>
          Home /
        </div>
      ) : (
        <></>
      )}
      {path.map((folder, index) => (
        <span key={folder} style={{ cursor: 'pointer' }} onClick={() => onNavigate(index, folder)}>
          {folder} {index < path.length - 1 ? ' / ' : ''}
        </span>
      ))}
    </div>
  );
};
