

const places = (state = [], action) => {

    switch (action.type) {
        case 'ADD_PLACE': {
            // check if user added new tags
            return [
                {
                    id: action.id,
                    url: action.url,
                    title: action.title,
                    tags: action.tags,
                }, ...state // concat :)
        ]
        }
        case 'EDIT_PLACE':
            return state.map(bookmark => {
                    if (bookmark.id === action.id) {
            return { ...bookmark, title: action.title, url: action.url, tags: action.tags }
        } else {
            return bookmark
        }
    });
    case 'REMOVE_PLACE':
        return state.filter(bookmark => bookmark.id !== action.id);
    default:
        return state;
    }
};
