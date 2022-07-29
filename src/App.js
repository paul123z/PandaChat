import React, { useRef, useState } from 'react';
import './App.css';

import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import 'firebase/compat/analytics';
// importing basic firebase stuff


//importing few hooks to make the processes easier
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

firebase.initializeApp({
  //your config, here i went to firebase and i click CREATE PROJECT
  
})


//setting global variables for the firabse authentication
const auth = firebase.auth();
const firestore = firebase.firestore();
const analytics = firebase.analytics();


//if there is a user object SHOW CHATROOM, otherwise show SignIn COMPONENT
function App() {

  const [user] = useAuthState(auth); //signed in -> user is an object ;; signed out -> user is null


  return (
    <div className="App">
      <header>
        <h1>🐼 Panda Chat 🐼</h1>
        <SignOut />
      </header>

      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>

    </div>
  );
}




//if someone presses the button, it runs the function signInWithGoogle
function SignIn() {

  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }


  const mystyle = {
    color: "white",
    backgroundColor: "DodgerBlue",
    padding: "20px",
    fontFamily: "Arial",
    textAlign: 'center'
    
  };

  return (
    <>
      <button className="sign-in" onClick={signInWithGoogle}>Sign in with Google</button>
      <p className="warningmessage" style={mystyle}>Welcome to Panda Chat. This is a chatting app for all panda lovers. Feel free to share your live for pandas!</p>
    </>
  )

}








function SignOut() {
  return auth.currentUser && (
    <button className="sign-out" onClick={() => auth.signOut()}>Sign Out</button>
  )
}











function ChatRoom() {
  const dummy = useRef();
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);

  const [messages] = useCollectionData(query, { idField: 'id' });

  const [formValue, setFormValue] = useState('');


  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })

    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth' }); 
  }

  return (<>
    <main>

      {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}

      <span ref={dummy}></span>

    </main>

    <form onSubmit={sendMessage}>

      <input value={formValue}  onChange={(e) => setFormValue(e.target.value)} placeholder="Say something panda friend!" />

      <button className="pandabutton" type="submit" disabled={!formValue}>🐼</button>

    </form>
  </>)
}













function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (<>
    <div className={`message ${messageClass}`}>
      <img src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} />
      <p>{text}</p>
    </div>
  </>)
}

export default App;
