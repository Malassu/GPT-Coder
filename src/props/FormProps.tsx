export interface ModalFormProps {
  visible: boolean;
  onCreate: (values: any) => void;
  onCancel: () => void;
}