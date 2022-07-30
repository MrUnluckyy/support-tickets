import { useEffect, useState } from 'react'

import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { FaPlus, FaTimes } from 'react-icons/fa'
import { useSelector, useDispatch } from 'react-redux'
import { getTicket, closeTicket } from '../features/tickets/ticketSlice'
import {
  getNotes,
  addNote,
  reset as notesReset,
} from '../features/notes/noteSlice'

import Modal from 'react-modal'

import NoteItem from '../components/NoteItem'
import BackButton from '../components/BackButton'
import Spinner from '../components/Spinner'

const customStyles = {
  content: {
    width: '600px',
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    position: 'relative',
  },
}

Modal.setAppElement('#root')

const Ticket = () => {
  const [modalIsOpen, setModalIsOpen] = useState(false)
  const [noteText, setNoteText] = useState('')

  const { ticket, isLoading, isSuccess, isError, message } = useSelector(
    (state) => state.ticket
  )
  const { notes, isLoading: isNotesLoading } = useSelector(
    (state) => state.note
  )

  const dispatch = useDispatch()
  const { ticketId } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    if (isError) {
      toast.error(message)
    }
    dispatch(getTicket(ticketId))
    dispatch(getNotes(ticketId))
  }, [isError, message, ticketId])

  const onTicketClose = () => {
    dispatch(closeTicket(ticketId))
    toast.success('Ticket closed successfully')
    navigate('/tickets')
  }

  const toggleModal = () => {
    setModalIsOpen((prevState) => !prevState)
  }

  const onNoteSubmit = (event) => {
    event.preventDefault()
    dispatch(addNote({ noteText, ticketId }))
    toggleModal()
  }

  if (isLoading || isNotesLoading) {
    return <Spinner />
  }
  if (isError) {
    return <h3>Something went wrong...</h3>
  }

  return (
    <div className='ticket-page'>
      <header className='ticket-header'>
        <BackButton url='/tickets' />
        <h2>
          Ticket ID: {ticket._id}
          <span className={`status status-${ticket.status}`}>
            {ticket.status}
          </span>
        </h2>
        <h3>
          Date Submitted: {new Date(ticket.createdAt).toLocaleString('lt-LT')}
        </h3>
        <h3>Product: {ticket.product}</h3>
        <hr />
        <div className='ticket-desc'>
          <h3>Description Of The Issue</h3>
          <p>{ticket.description}</p>
        </div>
        <h2>Notes</h2>
      </header>

      {ticket.status !== 'closed' && (
        <button onClick={toggleModal} className='btn'>
          <FaPlus /> Add Note
        </button>
      )}

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={toggleModal}
        style={customStyles}
        contentLabel='Add Note'
      >
        <h2>Add Note</h2>
        <button className='btn-close' onClick={toggleModal}>
          <FaTimes />
        </button>
        <form onSubmit={onNoteSubmit}>
          <div className='form-group'>
            <textarea
              name='noteText'
              id='noteText'
              className='form-control'
              placeholder='Note text'
              value={noteText}
              onInput={(event) => setNoteText(event.target.value)}
            ></textarea>
          </div>
          <div className='form-group'>
            <button className='btn' type='submit'>
              Submit
            </button>
          </div>
        </form>
      </Modal>

      {notes.length > 0 ? (
        notes.map((note) => <NoteItem key={note._id} note={note} />)
      ) : (
        <p>This ticket doesn't have any notes</p>
      )}

      {ticket.status !== 'closed' && (
        <button className='btn btn-block btn-danger' onClick={onTicketClose}>
          Close Ticket
        </button>
      )}
    </div>
  )
}

export default Ticket
