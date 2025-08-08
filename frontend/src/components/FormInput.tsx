import { useField } from "formik";
import { TextField } from "@mui/material";

interface FormInputProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
}

const FormInput = ({ label, ...props }: FormInputProps) => {
    const [field, meta] = useField(props.name);
  
    return (
      <TextField
        fullWidth
        label={label}
        variant="outlined"
        {...field}
        {...props}
        error={Boolean(meta.touched && meta.error)}
        helperText={meta.touched && meta.error ? meta.error : ""}
        margin="normal"
      />
    );
  };
  
export default FormInput;