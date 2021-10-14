import { combineReducers } from "redux";
import loginReducer from "./loginReducer";
import roomReducer from "./roomReducer";


export default combineReducers({
    loginState: loginReducer,
    roomsState: roomReducer
});