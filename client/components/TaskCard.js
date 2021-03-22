import React, {useState, useContext} from 'react'
import TaskCardDropDown from './TaskCardDropDown'
import {ProjectContext} from './ProjectProvider'

const onDragStart = (e, task) => {
  console.log('dragging task: ', task)
  e.dataTransfer.setData('text/plain', JSON.stringify(task))
}

import styles from './TaskCard.css'

const TaskCard = ({taskId}) => {
  // local state management for drop down render
  const [isActive, setActive] = useState(false)

  // useContext pulls in all tasks from ProjectProvider
  const {tasks, setTasks} = useContext(ProjectContext)

  // thisTask selects the appropriate task data from all tasks
  const thisTask = tasks.find((task) => task.id === taskId)

  // deconstruct task data
  const {id, name, createdBy, createdAt, description, status, user} =
    thisTask || {}

  return (
    <div draggable={true} onDragStart={(e) => onDragStart(e, thisTask)}>
      {isActive && <TaskCardDropDown taskId={id} />}
      <div className={styles.taskCardContainer}>
        <div className="material-icons">error_outline</div>
        <div className={styles.titleAndCreator}>
          <div className={styles.title}>{name}</div>
          <div
            className={styles.idAndCreatedBy}
            /* join user here to access user data: name, imageUrl */
          >{`#${id} opened by ${'USER_NAME_HERE'}`}</div>
        </div>
        <div className={styles.dotMenuAndAvatar}>
          <span className="material-icons" onClick={() => setActive(!isActive)}>
            more_horiz
          </span>
          {/* join user here to access user data: name, imageUrl */}
          <img src="USER_IMAGE_HERE" />
        </div>
      </div>
    </div>
  )
}

export default TaskCard
