import axios from 'axios'

const GET_ALL_COLUMNS = 'GET_ALL_COLUMNS'
const ADD_COLUMN = 'ADD_COLUMN'

const ADD_TASK = 'ADD_TASK'

const getAllColumns = (columns) => ({
  type: GET_ALL_COLUMNS,
  columns,
})

export const addColumn = (name) => ({
  type: ADD_COLUMN,
  name,
})

export const addTask = (columnId, name) => ({
  type: ADD_TASK,
  payload: {name, columnId},
})

export const fetchAllColumns = () => {
  return async (dispatch) => {
    try {
      const {data} = await axios.get('/api/columns')
      dispatch(getAllColumns(data))
    } catch (err) {
      console.error(err)
    }
  }
}

export const fetchAddColumn = (name) => {
  return async (dispatch) => {
    let {data} = await axios.post(`/api/columns/`, name)
    dispatch(addColumn(data))
  }
}

export const fetchAddTask = (columnId, name) => {
  return async (dispatch) => {
    let {data} = await axios.post(`/api/tasks/`, columnId, name)
    dispatch(addTask(data))
  }
}

const initialState = [
  {
    id: 1,
    name: 'Todo',
  },
  {
    id: 2,
    name: 'In-progress',
  },
  {
    id: 3,
    name: 'Review',
  },
  {
    id: 4,
    name: 'Done',
  },
]

export default function columns(state = initialState, action) {
  switch (action.type) {
    case GET_ALL_COLUMNS:
      return action.columns
    case ADD_COLUMN:
      const newColumn = {
        name: action.name,
      }
      return [...state, newColumn]
    case ADD_TASK:
      const newTask = {
        name: action.payload.name,
      }

      const newState = state.map((column) => {
        if (column.id === action.payload.columnId) {
          return [...state, newTask]
        } else {
          return column
        }
      })
      return newState
    default:
      return state
  }
}