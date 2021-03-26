import React from 'react'
import {withRouter} from 'react-router'
import ProjectProvider from '../context/projectContext'
import Board from './Board'
import styles from './css/ProjectView.css'

const ProjectView = ({match}) => {
  const projectId = +match.params.projectId

  return (
    <div className={styles.projectContainer}>
      <ProjectProvider projectId={projectId}>
        <Board />
      </ProjectProvider>
    </div>
  )
}

export default withRouter(ProjectView)
