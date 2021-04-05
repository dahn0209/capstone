import React, {useState} from 'react'
import Modal from './Modal'
import {getOrgDb, updateOrganizationDb} from '../context/axiosService'
import {notify} from './helper/toast'
import strConstraints from './helper/strConstrain'

import styles from './css/EditOrgModal.module.css'

const validate = (name, description, imageUrl) => {
  let errors = []

  if (!name.length) errors.push('Organization name must not be empty!')
  if (name > strConstraints.titleMaxChar)
    errors.push(
      `Organization name is limited to ${strConstraints.titleMaxChar} characters!`
    )

  if (description > strConstraints.textMaxChar)
    errors.push(
      `Organization description is limited to ${strConstraints.textMaxChar} characters!`
    )

  if (!imageUrl.length) errors.push('URL must not be empty!')
  // implement check if valid url later

  return errors
}

const EditOrgModal = ({
  currentOrgId,
  organizations,
  setOrganizations,
  closeModal,
}) => {
  // grab org from organizations by orgId
  const thisOrg = organizations.find((org) => org.id === currentOrgId)

  // set local state
  const [name, setName] = useState(thisOrg.name)
  const [imageUrl, setImageUrl] = useState(thisOrg.imageUrl)

  const editOrganization = async () => {
    const errors = validate(name, imageUrl)

    if (errors.length) {
      errors.forEach((error) => {
        notify(error, 'error')
      })

      return
    }

    await updateOrganizationDb(currentOrgId, {
      name: name,
      imageUrl: imageUrl,
    })

    // get new organization info from db
    const updatedOrg = await getOrgDb(currentOrgId)

    // update all orgs state
    setOrganizations(
      organizations.map((org) => (org.id === currentOrgId ? updatedOrg : org))
    )

    closeModal()

    notify(`Organization "${name}" updated!`, 'success')
  }

  return (
    <Modal>
      <div className={styles.modalContent}>
        <div className={styles.labelAndInput}>
          <label htmlFor="name">Name</label>
          <input
            type="text"
            className={styles.projectNameInput}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className={styles.preContainer}>
          <pre>
            <img src={imageUrl} />
          </pre>
        </div>

        <div className={styles.labelAndInput}>
          <label htmlFor="imageUrl">Image url</label>
          <input
            type="text"
            className={styles.projectNameInput}
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
        </div>
        <div className={styles.modalBtnsContainer}>
          <button
            type="button"
            className={styles.editBtn}
            onClick={editOrganization}
          >
            Save Organization Info
          </button>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={closeModal}
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default EditOrgModal
