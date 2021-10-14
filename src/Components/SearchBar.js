import React, { useState } from 'react';

// materialUI
import { makeStyles, withStyles } from '@material-ui/core/styles';
import {  Grid, TextField } from '@material-ui/core/';

// internal
import { FormSelect } from '.';

const GrowGrid = withStyles({
  root: {
    flexGrow: 1
  }
})(Grid);


export default function SearchBar(props) {
    const {input, handleSearch, options} = props;
    const [selectCategory, setSelectCategory] = useState("All");

    const useStyles = makeStyles((theme) => ({
        root: {
          background: 'white',
        }
    }));

    const classes = useStyles();

    return (
      <React.Fragment>
        <Grid container item alignItems={"center"} xs={12}>
          <Grid item>
            <FormSelect
              id={"search-category"}
              required={false}
              options={options}
              fullWidth={false}
              onChange={(e) => setSelectCategory(e.target.value)}
              value={selectCategory}
            />
          </Grid>
          <GrowGrid item>
            <TextField
                InputProps={{
                  className: classes.root,
                }}
                fullWidth={true}
                placeholder="Search"
                variant="outlined"
                size="small"
                input={input}
                onChange={(e) => handleSearch(e.target.value, selectCategory)}
                type="text"
            />
          </GrowGrid>
        </Grid>
      </React.Fragment>
    )
}