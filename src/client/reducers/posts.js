const initialState = {
	post: {
    title: '',
    body: ''
  }
}

export default function asyncReducer(state = initialState, action) {
  switch (action.type) {
    case 'FETCHED_DATA':
      return {...state, post: action.payload};
    default:
      return state;
  }
}