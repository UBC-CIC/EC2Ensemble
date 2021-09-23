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

import { ToggleButton, ToggleButtonGroup} from '@material-ui/lab';

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

export const FormButtonGroup = (props) => {
    const {id, inputLabel, options, value, onChange, disabled} = props;

    const useStyles = makeStyles((theme) => ({
        root: {
            margin: theme.spacing(2,0,3,0)
        },
        fullWidth: {
            width: '100%',
        },
        input: {
            marginTop: "-13px",
            marginBottom: "5px"
        }
    }));

    const classes = useStyles();

    return (
        <div className={classes.root}>
            <InputLabel htmlFor={id} className={classes.input}>
                {inputLabel}
            </InputLabel>
            <ToggleButtonGroup
                size="small"
                className={classes.fullWidth}
                exclusive
                id={id}
                value={value}
            >
                {options.map((option, index) => 
                    <ToggleButton 
                        key={`${id}-${index}`} 
                        value={option} 
                        className={classes.fullWidth}
                        onClick={onChange}
                        disabled={disabled}
                    >
                        {option}
                    </ToggleButton>
                )}
            </ToggleButtonGroup>
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
