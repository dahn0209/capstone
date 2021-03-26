import React, {useContext} from 'react'
import {Draggable} from 'react-beautiful-dnd'
import styled from 'styled-components'
import TaskCardDropDown from './TaskCardDropDown'
import {AuthContext} from '../context/authContext'
import {ColumnContext} from '../context/columnContext'
import {TaskContext} from '../context/taskContext'
import styles from './css/TaskCard.css'

const Container = styled.div`
  border-radius: 1px;
  padding: 1px;
  margin-bottom: 1px;
`

const TaskCard = ({task, index}) => {
  // local state management for drop down render
  const {activeTask, setActiveTask} = useContext(ColumnContext)

  // local state management for selecting a particular dropdown
  // important! this prevents opening EVERY dropdown dialog
  // for all tasks in a column
  const {
    dropDownTargetId,
    setDropDownTargetId,
    isTaskDropDownVisible,
    setTaskDropDownVisible,
  } = useContext(TaskContext)

  // get user from auth context
  const {user} = useContext(AuthContext)

  const {id, description} = task

  const {users} = task || []

  // returns firstName + lastName for task card "opened by _____"
  const getFullName = () => {
    if (!users || (users && !users.length)) return ''
    return `${users[0].firstName} ${users[0].lastName}`
  }

  return (
    <Draggable draggableId={String(task.id)} index={index}>
      {(provided) => (
        <Container
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <div>
            {isTaskDropDownVisible && (
              <TaskCardDropDown
                task={task}
                closeDropDown={() =>
                  setTaskDropDownVisible(!isTaskDropDownVisible)
                }
              />
            )}
            <div className={styles.taskCardContainer}>
              <div className="material-icons">error_outline</div>
              <div className={styles.titleAndCreator}>
                <div className={styles.title}>{description}</div>
                <div className={styles.idAndCreatedBy}>
                  {`#${id} opened by ${getFullName()}`}
                </div>
              </div>
              <div className={styles.dotMenuAndAvatar}>
                <span
                  className="material-icons"
                  onClick={() => {
                    setDropDownTargetId(task.id)
                    setTaskDropDownVisible(!isTaskDropDownVisible)
                  }}
                >
                  more_horiz
                </span>
                <img src={user.imageUrl} />
              </div>
            </div>
          </div>
        </Container>
      )}
    </Draggable>
  )
}

export default TaskCard
