import * as appActions from './components/actions/app';

var initialViewState = {
  currentStateSelection : null,
  currentCitySelection: null,
  currentBusinessSelection: null
};

function viewState(state=initialViewState, action){
  switch (action.type) {
    case appActions.PATCH_BUSINESS_STATE:
      return Object.assign({}, state, { currentBusinessSelection : action.payload });
    case appActions.PATCH_CURRENT_STATE_SELECTION:
      return Object.assign({}, state, { currentStateSelection : action.payload });
    case appActions.PATCH_CURRENT_CITY_SELECTION:
      return Object.assign({}, state, { currentCitySelection : action.payload });
    default:
      return state;
  }
}

export default {
  viewState
};
