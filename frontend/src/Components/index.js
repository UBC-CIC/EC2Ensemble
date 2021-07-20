import React, { useState } from 'react';

// materialUI
import { makeStyles, withStyles } from '@material-ui/core/styles';
import { 
    TextField,

    FormControl,
    InputLabel,
    Select,

    InputAdornment,
    IconButton,
} from '@material-ui/core/';

// icons
import SearchIcon from '@material-ui/icons/Search';

const CustomFormControl = withStyles((theme) => ({
    root: {
        '& .MuiFormLabel-root': {
            transform: 'translate(0px, -13px)',
        },
        '& .MuiOutlinedInput-root': {
            '& fieldset': {
                borderRadius: 5,
            },
            margin: theme.spacing(1,0) 
        },
    },
}))(FormControl);


export const FormInput = (props) => {
    const {id, inputLabel, required, ...others } = props;
  
    const useStyles = makeStyles((theme) => ({
        root: {
            margin: theme.spacing(2,0)
        }
    }));
  
    const classes = useStyles();
    return (
        <div className={classes.root}>
            <CustomFormControl fullWidth>
                <InputLabel htmlFor={id}>
                    {inputLabel}
                </InputLabel>
                <TextField 
                    required={required}
                    id={id}
                    name={id}
                    type="text" 
                    variant="outlined"
                    size="small"
                    {...others}
                />
            </CustomFormControl>
        </div>
    )
}

export const FormSelect = (props) => {
    const {id, inputLabel, required, options, ...others } = props;

    const useStyles = makeStyles((theme) => ({
        root: {
            margin: theme.spacing(2,0)
        }
    }));
  
    const classes = useStyles();
    return (
        <div className={classes.root}>
            <CustomFormControl variant="outlined" size="small" fullWidth>
                <InputLabel htmlFor={id}>
                    {inputLabel}
                </InputLabel>
                <Select
                    native
                    required={required}
                    name={id}
                    id={id}
                    {...others}
                >
                    {options.map((option, index) => 
                        <option key={`${id}-${index}`} value={option}>
                            {option}
                        </option>
                    )}
                </Select>
            </CustomFormControl>
        </div>
    )
}



// https://github.com/mui-org/material-ui/issues/13570
const BorderTextField = withStyles({
    root: {
      '& .MuiOutlinedInput-root': {
        '& fieldset': {
          borderRadius: "50px",
        },
      },
    },
})(TextField);

export const SearchBar = () => {
    return (
      <BorderTextField
          fullWidth={true}
          placeholder="Search"
          variant="outlined"
          size="small"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                  <IconButton type="submit" size="small" aria-label="search-button">
                      <SearchIcon />
                  </IconButton>
              </InputAdornment>
            ),
          }}
      />
    )
  }
