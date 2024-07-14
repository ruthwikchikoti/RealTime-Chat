import React from "react";
import { useState, useEffect } from "react";
import { auth, database } from "../firebase";


function Chat() {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);

    //current user
    const currentUser = auth.currentUser;

    useEffect(() => {
        const usersRef = database.ref('users');
        usersRef.on('value', (snapshot) => {
            const usersData = snapshot.val();
            const activeUsers = Object.keys(usersData || {}).filter(
                (uid) => usersData[uid].online && uid !== currentUser.uid
            );
            setUsers(activeUsers);
        });

        // Status of the current user
        const currentUserRef = database.ref(`users/${currentUser.uid}`);
        currentUserRef.update({ online: true });
        currentUserRef.onDisconnect().update({ online: false });

        return () => {
            usersRef.off();
            currentUserRef.off();
        }

    }, [currentUser.uid]);

    useEffect(() => {
        if (selectedUser) {
            const messagesRef = database.ref(`messages/${getChildId(selectedUser)}`);
            messagesRef.on('value', (snapshot) => {
                const messagesData = snapshot.val();
                if (messagesData) {
                    const messagesList = Object.entries(messagesData).map(([key, value]) => ({
                        id: key,
                        ...value
                    }));
                    setMessages(messagesList);
                    updateMessageStatus(messagesList);
                } else {
                    setMessages([]);
                }
            });
            return () => messagesRef.off();
        }
    }, [selectedUser]);

    const getChildId = (othersUserId) => {
        return [currentUser.uid, othersUserId].sort().join('_');
    };

    const sendMessage = () => {
        if (message.trim() && selectedUser) {
            const messageRef = database.ref(`messages/${getChildId(selectedUser)}`).push();
            messageRef.set({
                sender: currentUser.uid,
                text: message,
                timestamp: database.ServerValue.TIMESTAMP,
                status: 'sent'
            });
            setMessage('');
        }
    };

    const updateMessageStatus = (messagesList) => {
        messagesList.forEach((msg) => {
            if (msg.sender !== currentUser.uid && msg.status !== 'read') {
                database.ref(`messages/${getChildId(selectedUser)}/${msg.id}`).update({ status: 'read' });
            } else if (msg.sender !== currentUser.uid && msg.status === 'sent') {
                database.ref(`messages/${getChildId(selectedUser)}/${msg.id}`).update({ status: 'delivered' });
            }
        })

    };

    const handleLogout =  () => {
        auth.signOut();
    };


    return (
        <div>
            <h2>Welcome, {currentUser.email}</h2>
            <button onClick={handleLogout}>Logout</button>
            <div style={{ display: 'flex' }}>
                <div style={{ width: '30%' }}>
                    <h3>Active Users</h3>
                    <ul>
                        {users.map((userId) => (
                            <li key={userId} onClick={() => setSelectedUser(userId)}>
                                {userId}
                            </li>
                        ))}
                    </ul>
                </div>
                {selectedUser && (
                    <div style={{ width: '70%' }}>
                        <h3>Chat with {selectedUser}</h3>
                        <div style={{ height: '300px', overflowY: 'scroll', border: '1px solid #ccc' }}>
                            {messages.map((msg) => (
                                <div key={msg.id} style={{ textAlign: msg.sender === currentUser.uid ? 'right' : 'left' }}>
                                    <p>{msg.text}</p>
                                    <small>{msg.status}</small>
                                </div>
                            ))}
                        </div>
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type a message"
                        />
                        <button onClick={sendMessage}>Send</button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Chat;







