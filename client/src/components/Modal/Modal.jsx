import './Modal.css';
const Modal = ({ count, restartGame }) => {

    return (
        <div className='Modal'>
            <h2>Your Score: {count}</h2>
            <button onClick={()=> restartGame()}>Ok</button>
        </div>
    )
}

export default Modal;