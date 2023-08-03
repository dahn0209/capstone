import React, {useState, useContext, useEffect} from 'react'
import AddOrganizationDialog from './AddOrganizationDialog'
import Modal from './Modal'
import LeaveOrgModal from './LeaveOrgModal'
import EditOrgModal from './EditOrgModal'
import DeleteOrgModal from './DeleteOrgModal'
import Invitations from './Invitations'
import {Link} from 'react-router-dom'
import {AuthContext} from '../context/authContext'
import InvitationProvider, {
  InvitationContext,
} from '../context/invitationContext'
import {notify} from './helper/toast'
import styles from './css/AllOrgs.module.css'
import {
  fetchUserOrgs,
  removeUserFromOrgDB,
  editOrganizationDB,
  deleteOrganizationDB,
  fetchUserDB,
} from '../context/axiosService'
import socket, {socketSent, socketReceived} from '../socket'

const OrganizationCard = ({
  userId,
  organization,
  setCurrentOrgId,
  setActiveField,
}) => {
  const {name, imageUrl} = organization
  const orgId = organization.id

  // only organization admins can edit, delete orgs
  const isOrgAdmin =
    organization.users.find((member) => member.id === userId).user_organization
      .role === 'admin'

  return (
    <div className={styles.orgCardContainer}>
      <Link to={`/organizations/${orgId}`}>
        <div className={styles.imgAndOrgName}>
          <img src={imageUrl} className={styles.allOrgsImg} />
          <div className={styles.orgName}>{name}</div>
          <div className={styles.numMembers}>{`${
            organization.users ? organization.users.length : 0
          } members`}</div>
        </div>
      </Link>
      <div className={styles.orgBtnsContainer}>
        <button
          className={styles.modifyOrgBtn}
          type="button"
          onClick={() => {
            setCurrentOrgId(orgId)
            setActiveField('leaveOrg')
          }}
        >
          Leave
        </button>
        {/* only show edit, delete btns if auth user is admin of organization */}
        {isOrgAdmin && (
          <div className={styles.editAndDelete}>
            <span
              className={styles.editBtn}
              onClick={() => {
                setCurrentOrgId(orgId)
                setActiveField('editOrg')
              }}
            >
              edit
            </span>
            <span className={styles.divider}>|</span>
            <span
              className={styles.deleteBtn}
              onClick={() => {
                setCurrentOrgId(orgId)
                setActiveField('deleteOrg')
              }}
            >
              delete
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

const AllOrgs = () => {
  // grab user from auth context
  const {user} = useContext(AuthContext)

  // grab invitations and setter from invitation context
  const {
    invitations,
    setInvitations,
    invitationsWereEdited,
    setInvitationsWereEdited,
  } = useContext(InvitationContext)

  // initialize all orgs state
  const [organizations, setOrganizations] = useState([])
  const [orgWasEdited, setOrgWasEdited] = useState(false)

  // fetch all orgs   ////useEffect() is like react cycle componenetDIdmount and componentDiduptate
  useEffect(() => {
    const fetchAllOrgs = async () => {
      try {
        const orgs = await fetchUserOrgs(user.id)
        setOrganizations(orgs)
      } catch (err) {
        console.error(err)
      }
    }
    fetchAllOrgs()
  }, [invitations, orgWasEdited])

  // delete a single org and persist to local state
  const leaveOrg = async (orgId) => {
    try {
      await removeUserFromOrgDB(orgId, user.id)
      setOrgWasEdited(!orgWasEdited)

      const fetchedUserWithRole = await fetchUserDB(user.id)

      socket.emit(socketSent.LEAVE_ORG, {
        ignoreUser: socket.id,
        userWhoLeft: fetchedUserWithRole,
      })
    } catch (err) {
      console.error(err)
    }
  }

  // edit a single org and persist to local state
  const editOrg = async (orgId, updateInfo) => {
    try {
      const editedOrg = await editOrganizationDB(orgId, updateInfo)
      const projectIdArray = editedOrg.projects
        ? editedOrg.projects.map((project) => project.id)
        : []
      console.log(editedOrg)
      console.log(editedOrg.projects)
      setOrgWasEdited(!orgWasEdited)
      socket.emit(socketSent.EDIT_ORG, {
        ignoreUser: socket.id,
        projectIdArray: projectIdArray,
      })
    } catch (err) {
      console.error(err)
    }
  }

  // delete a single org and persist to local state
  const deleteOrg = async (orgForDelete) => {
    try {
      const projectIdArray = orgForDelete.projects
        ? orgForDelete.projects.map((project) => project.id)
        : []
      await deleteOrganizationDB(orgForDelete.id)
      setOrgWasEdited(!orgWasEdited)
      socket.emit(socketSent.DELETE_ORG, {
        ignoreUser: socket.id,
        projectIdArray: projectIdArray,
      })
      notify(`Organization successfully deleted!`, 'warning')
    } catch (err) {
      console.error(err)
    }
  }

  // local state for modals
  const [activeField, setActiveField] = useState('')
  const [currentOrgId, setCurrentOrgId] = useState(0)

  // handle remote edit, delete orgs and user leave, removed org events
  // important! user left only needs to be registered as an org edit, even though the payload includes the userWhoLeft (we don't need to process it here ...)
  socket.on(socketReceived.USER_LEFT_ORG, ({ignoreUser}) => {
    if (socket.id === ignoreUser) return
    setOrgWasEdited(!orgWasEdited)
  })
  socket.on(socketReceived.ORG_WAS_EDITED, ({ignoreUser}) => {
    if (socket.id === ignoreUser) return
    setOrgWasEdited(!orgWasEdited)
  })
  socket.on(socketReceived.ORG_WAS_DELETED, ({ignoreUser}) => {
    if (socket.id === ignoreUser) return
    setOrgWasEdited(!orgWasEdited)
  })
  socket.on(
    socketReceived.USER_WAS_REMOVED,
    ({ignoreUser, removedUserId, removedOrgId}) => {
      if (socket.id === ignoreUser) return

      // need to fire this rather that setOrg to avoid permissions issue since user no longer has access to GET / this org
      setOrganizations(organizations.filter((org) => org.id !== removedOrgId))
    }
  )

  // handle remote invitations sent to thisUser
  socket.on(socketReceived.INVITE_WAS_SENT, ({invitedUserId}) => {
    if (user.id === invitedUserId) console.log('heyo invite received!')
    setInvitationsWereEdited(!invitationsWereEdited)
  })

  return (
    <div className={styles.wrapper}>
      {activeField === 'leaveOrg' && (
        <Modal>
          <LeaveOrgModal
            leaveOrg={leaveOrg}
            currentOrgId={currentOrgId}
            organizations={organizations}
            closeModal={() => setActiveField('')}
          />
        </Modal>
      )}
      {activeField === 'editOrg' && (
        <Modal>
          <EditOrgModal
            editOrg={editOrg}
            currentOrgId={currentOrgId}
            organizations={organizations}
            closeModal={() => setActiveField('')}
          />
        </Modal>
      )}
      {activeField === 'deleteOrg' && (
        <Modal>
          <DeleteOrgModal
            deleteOrg={deleteOrg}
            currentOrgId={currentOrgId}
            organizations={organizations}
            closeModal={() => setActiveField('')}
          />
        </Modal>
      )}
      <div className={styles.leftPanel}>
        <Invitations
          invitations={invitations}
          setInvitations={setInvitations}
          organizations={organizations}
          setOrganizations={setOrganizations}
        />
      </div>

      <div className={styles.headerAndOrgs}>
        <div className={styles.headerAndCreateBtn}>
          <div className={styles.sectionHeader}>My Organizations</div>
          <AddOrganizationDialog
            organizations={organizations}
            setOrganizations={setOrganizations}
          />
        </div>

        <div className={styles.allOrgsContainer}>
          {organizations.map((org) => (
            <OrganizationCard
              key={org.id}
              userId={user.id}
              organization={org}
              setCurrentOrgId={setCurrentOrgId}
              setActiveField={setActiveField}
              setOrganizations={setOrganizations}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

const WrappedOrgs = () => (
  <InvitationProvider>
    <AllOrgs />
  </InvitationProvider>
)

export default WrappedOrgs
