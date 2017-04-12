import * as appActions from './components/actions/app';

var initialViewState = {
  currentStateSelection : null,
  currentCitySelection: null,
  allCurrentCityOptions: null,
  currentBusinessSelection: null,
  currentBusinesses: null,
  compDistance: null,
  monthsToShow: 6,
  mostNegativeReview: null,
  mostPositiveReview: null,
  wordsUsedInRefinedReviews: ["Pool, Lazy, River, Wave, Lazy River, Wave Pool", "Pool, Lazy, River, Wave, Lazy River, Wave Pool"],
  ratingsForGroups: [3.5, 4]
};

function viewState(state=initialViewState, action){
  switch (action.type) {
    case appActions.PATCH_BUSINESS_STATE:
      return Object.assign({}, state, { currentBusinessSelection : action.payload });
    case appActions.PATCH_ALL_CITY_OPTIONS:
      return Object.assign({}, state, { allCurrentCityOptions : action.payload });
    case appActions.PATCH_COMP_DISTANCE:
      return Object.assign({}, state, { compDistance : action.payload });
    case appActions.PATCH_BUSINESSES:
      return Object.assign({}, state, { currentBusinesses : action.payload });
    case appActions.PATCH_CURRENT_STATE_SELECTION:
      return Object.assign({}, state, { currentStateSelection : action.payload });
    case appActions.PATCH_CURRENT_CITY_SELECTION:
      return Object.assign({}, state, { currentCitySelection : action.payload });
    case appActions.PATCH_SETIMENT:
      return Object.assign({}, state, { mostNegativeReview : action.payload.negative, mostPositiveReview : action.payload.positive });
    case appActions.PATCH_REFINED_REVIEWS:
      return Object.assign({}, state, { wordsUsedInRefinedReviews : action.payload.wordsUsed, ratingsForGroups : action.payload.rating });
    default:
      return state;
  }
}

export default {
  viewState
};
