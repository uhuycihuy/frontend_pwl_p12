import React, { useEffect, useState, useRef } from 'react';
import { Link } from "react-router-dom";
import axios from "axios";

const Userlist = () => {
    const [users, setUsers] = useState([]);
    const [originalUsers, setOriginalUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const workerRef = useRef(null);

    useEffect(() => {
        workerRef.current = new Worker('/workers/workerUser.js');
        
        workerRef.current.onmessage = (e) => {
            setUsers(e.data);
        };

        getUsers();
        return () => {
            workerRef.current.terminate();
        };
    }, []);

    const getUsers = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get("http://localhost:5000/users");
            setUsers(response.data);
            setOriginalUsers(response.data); 
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const deleteUser = async (userId) => {
        await axios.delete(`http://localhost:5000/users/${userId}`);
        getUsers();
    };

    const sortByName = () => {
        workerRef.current.postMessage({
            users: originalUsers,
            action: 'SORT_BY_NAME'
        });
    };

    const filterByRole = (role) => {
        workerRef.current.postMessage({
            users: originalUsers,
            action: 'FILTER_BY_ROLE',
            payload: { role }
        });
    };

    const resetFilter = () => {
        workerRef.current.postMessage({
            users: originalUsers,
            action: 'RESET'
        });
    };

    return (
        <div>
            <h1 className='title has-text-black'>Users</h1>
            <h2 className='subtitle has-text-black'>List of Users</h2>
            
            <div className="buttons mb-4">
                <Link to="/users/add" className="button is-primary">
                    Add New
                </Link>
                <button onClick={sortByName} className="button is-info">
                    Sort by Name
                </button>
                <button onClick={() => filterByRole('admin')} className="button is-warning">
                    Filter Admin
                </button>
                <button onClick={() => filterByRole('user')} className="button is-success">
                    Filter User
                </button>
                <button onClick={resetFilter} className="button is-danger">
                    Reset Filter
                </button>
            </div>

            {isLoading ? (
                <div className="has-text-centered">Loading users...</div>
            ) : (
                <table className='table is-striped is-fullwidth'>
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user, index) => (
                            <tr key={user.uuid}>
                                <td>{index + 1}</td>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td>{user.role}</td>
                                <td>
                                    <Link
                                        to={`/users/edit/${user.uuid}`}
                                        className="button is-small is-info"
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() => deleteUser(user.uuid)}
                                        className="button is-small is-danger ml-2"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default Userlist;