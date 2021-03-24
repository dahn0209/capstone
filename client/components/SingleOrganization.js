import React, {useState, useEffect, useMemo} from 'react'
import axios from 'axios'
import {Link} from 'react-router-dom'
import ProjectCard from './ProjectCard'
import UserCard from './UserCard'
import styles from './css/SingleOrganization.css'

const SingleOrganization = ({match}) => {
  // grab orgId from match
  const organizationId = +match.params.organizationId

  // assign local state
  const [organization, setOrganization] = useState({})
  const [projects, setProjects] = useState([])

  // get single org with direct api call
  // no context/provider here since it's a direct route
  useEffect(() => {
    const fetchSingleOrg = async () => {
      try {
        const {data} = await axios.get(`/api/organizations/${organizationId}`)
        setOrganization(data)
        setProjects(data.projects)
      } catch (err) {
        console.error(err)
      }
    }
    fetchSingleOrg()
  }, [])

  // memoize to keep rerenders to a minimum
  useMemo(() => {
    return {
      organization,
      setOrganization,
      projects,
      setProjects,
    }
  }, [organization, projects])

  // destructure organization
  const {name, imageUrl, users} = organization

  console.log(users)

  return (
    <div className="topLevelViewContainer">
      <div className={styles.imgAndOrgName}>
        <img src={imageUrl} />
        <div className={styles.organizationName}>{name}</div>
      </div>
      <div className={styles.membersAndProjects}>
        <div className={styles.memberList}>
          {users && users.map((user) => <UserCard key={user.id} user={user} />)}
        </div>
        <div className={styles.projectList}>
          {projects &&
            projects.map((project) => <ProjectCard project={project} />)}
        </div>
      </div>
    </div>
  )
}

export default SingleOrganization

// const dummyJSX = (
//   <div>
//     Projects:
//     {projects.map((project) => (
//       <Link to={`/projects/${project.id}`} key={project.id}>
//         <img src={project.imageUrl} />
//         <div>{project.name}</div>
//         <div>{project.status}</div>
//         <div>{project.description}</div>
//       </Link>
//     ))}
//   </div>
// )
