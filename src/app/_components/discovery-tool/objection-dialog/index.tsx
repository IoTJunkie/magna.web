import React, { Dispatch, SetStateAction, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  DialogTrigger,
  Menu,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
  Spinner,
} from '@fluentui/react-components';
import ObjectionBox from '../objection-box';
import classNames from 'classnames';
import { IObjection } from '@/app/types/interrogative';
import CustomIcon from '../../common/CustomIcon';
import { getSession } from 'next-auth/react';
import CustomObjectionDialog from './custom-objection-dialog';

interface IObjectionDialogProps {
  open?: boolean;
  onCancel?: () => void;
  objections: IObjection[];
  setIsOpenObjectionsDialog: Dispatch<SetStateAction<boolean>>;
  uploadSelectedObjections: (objections: any[]) => void;
  loadingObjection: boolean;
  caseId: string;
  objectionsSelected: IObjection[];
  getObjectionsList: () => void;
}

const ObjectionDialog = ({
  open,
  onCancel,
  objections,
  uploadSelectedObjections,
  loadingObjection,
  caseId,
  objectionsSelected,
  getObjectionsList,
}: IObjectionDialogProps) => {
  const [selectedObjections, setSelectedObjections] = useState<IObjection[]>(objectionsSelected);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [idObjection, setIdObjection] = useState<string>('');
  const handleAdd = async () => {
    setIsEditMode(false);
    setLoading(true);
    try {
      const session = await getSession();
      let config = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.user?.access_token}`,
        },
        body: JSON.stringify({
          name: title,
          description: description,
          case_id: caseId,
        }),
      };
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/discovery/interrogative-object/cases/${caseId}`,
        config,
      );
      if (res.ok) {
        getObjectionsList();
      }
      setIsFormOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (objection: IObjection) => {
    const session = await getSession();
    setLoading(true);
    try {
      let config = {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.user?.access_token}`,
        },
        body: JSON.stringify({
          name: objection.name,
          description: objection.description,
          case_id: caseId,
        }),
      };
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/discovery/interrogative-object/${objection.id}`,
        config,
      );
      setIsFormOpen(false);
      if (res.ok) {
        getObjectionsList();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (objection: IObjection) => {
    const session = await getSession();
    try {
      let config = {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.user?.access_token}`,
        },
      };
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/discovery/interrogative-object/${objection.id}`,
        config,
      );
      if (res.ok) {
        getObjectionsList();
        setSelectedObjections((prev) => prev.filter((item) => item.id !== objection.id));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleClose = () => {
    setIsFormOpen(false);
  };
  return (
    <>
      <Dialog open={open} modalType='alert'>
        <DialogSurface className='h-[90%] w-[95%] md:!min-w-[62.5rem]'>
          <DialogBody>
            <DialogTitle className='!text-lg !font-semibold'>Choose Objection(s)</DialogTitle>
            <DialogContent className='!text-support'>
              <h3>You can choose multiple objections from the list, or create a new objection</h3>
              <div className='flex flex-col gap-[0.9375rem] p-[1rem] '>
                <Button
                  size='large'
                  onClick={() => {
                    setIsFormOpen(true);
                    setTitle('');
                    setDescription('');
                    setIsEditMode(false);
                  }}
                >
                  <CustomIcon name='add-more' width={15} height={15} className='mr-1' />
                  Add New Objection
                </Button>
                {[...objections].reverse().map((objection) => (
                  <div key={objection.id} className='relative'>
                    <ObjectionBox
                      title={objection.name}
                      content={objection.description}
                      onClick={() => {
                        if (selectedObjections.some((item) => item.id === objection.id)) {
                          setSelectedObjections((prev) =>
                            prev.filter((item) => item.id !== objection.id),
                          );
                        } else {
                          setSelectedObjections((prev) => [
                            ...prev,
                            { ...objection, id: objection.id },
                          ]);
                        }
                      }}
                      isSelected={selectedObjections.some((item) => item.id === objection.id)}
                    />
                    <Menu>
                      <MenuTrigger>
                        <div className='absolute right-6 top-6'>
                          <CustomIcon name='options' className='hover:cursor-pointer' />
                        </div>
                      </MenuTrigger>
                      <MenuPopover>
                        <MenuList>
                          <MenuItem
                            icon={<CustomIcon name='edit-icon' />}
                            onClick={() => {
                              setIsEditMode(true);
                              setIsFormOpen(true);
                              setTitle(objection.name);
                              setDescription(objection.description);
                              setIdObjection(objection.id);
                            }}
                          >
                            Edit
                          </MenuItem>
                          <MenuItem
                            icon={<CustomIcon name='delete' />}
                            onClick={() => handleDelete(objection)}
                          >
                            <div className='text-[#F04438]'>Delete</div>
                          </MenuItem>
                        </MenuList>
                      </MenuPopover>
                    </Menu>
                  </div>
                ))}
              </div>
            </DialogContent>
            <DialogActions>
              <DialogTrigger disableButtonEnhancement>
                <Button
                  className='!border-aero-10 !text-base !font-semibold'
                  size='large'
                  onClick={onCancel}
                >
                  Cancel
                </Button>
              </DialogTrigger>

              <DialogTrigger disableButtonEnhancement>
                <Button
                  className={classNames('!text-base !font-semibold', {
                    '!bg-bg-disable !text-colorNeutralForegroundDisabled':
                      selectedObjections.length === 0,
                    '!bg-aero-7 !text-confirm': selectedObjections.length > 0,
                  })}
                  size='large'
                  onClick={() => {
                    uploadSelectedObjections(selectedObjections);
                  }}
                  disabled={selectedObjections.length === 0}
                >
                  {loadingObjection && <Spinner size='tiny' className='mr-1' />}
                  Select
                </Button>
              </DialogTrigger>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      <CustomObjectionDialog
        isFormOpen={isFormOpen}
        title={title}
        description={description}
        setTitle={setTitle}
        setDescription={setDescription}
        handleAdd={handleAdd}
        handleEdit={handleEdit}
        handleClose={handleClose}
        isEditMode={isEditMode}
        idObjection={idObjection}
        isLoading={loading}
      />
    </>
  );
};

export default ObjectionDialog;
