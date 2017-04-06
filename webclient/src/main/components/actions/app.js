import {createAction} from 'redux-actions';

export const PATCH_BUSINESS_STATE = 'PATCH_BUSINESS_STATE';
export const patchBusinessSelection = createAction(PATCH_BUSINESS_STATE);

export const PATCH_CURRENT_STATE_SELECTION = 'PATCH_CURRENT_STATE_SELECTION';
export const patchCurrentStateSelection = createAction(PATCH_CURRENT_STATE_SELECTION);

export const PATCH_CURRENT_CITY_SELECTION = 'PATCH_CURRENT_CITY_SELECTION';
export const patchCurrentCitySelection = createAction(PATCH_CURRENT_CITY_SELECTION);

export const PATCH_ALL_CITY_OPTIONS = 'PATCH_ALL_CITY_OPTIONS';
export const patchCurrentCityOptions = createAction(PATCH_ALL_CITY_OPTIONS);

export const PATCH_COMP_DISTANCE = 'PATCH_COMP_DISTANCE';
export const patchCompDistance = createAction(PATCH_COMP_DISTANCE);

export const PATCH_BUSINESSES = 'PATCH_BUSINESSES';
export const patchBuisnesses = createAction(PATCH_BUSINESSES);
