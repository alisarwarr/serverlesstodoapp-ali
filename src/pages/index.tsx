import React, { useState } from 'react';
import style from './index.module.scss';
import classnames from 'classnames';
//MATERIAL-UI
import Card from '@material-ui/core/Card';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import IconButton from '@material-ui/core/IconButton';
import CircularProgress from '@material-ui/core/CircularProgress';
import useMediaQuery from '@material-ui/core/useMediaQuery';
//SWEETALERT2
import Swal from 'sweetalert2';
//COMPONENT
import Heading from '../components/Heading';
import Loading from '../components/Loading';
import ReadModal from '../components/ReadModal';
import Head from '../components/Head'
//APOLLO_GRAPHQL
import { gql, useQuery, useMutation } from '@apollo/client';

const truncate = (str: string, n: number) => str?.length > n ? `${str.substr(0, n-1)}` : str;

const ALL_QUERY = gql`
    query {
        allTodos {
            id
            detail
        }
    }
`
const CREATE_MUTATION = gql`
    mutation($words: String!) {
        createTodo(words: $words) {
            detail
        }
    }
`

const DELETE_MUTATION = gql`
    mutation($id: ID!) {
        deleteTodo(id: $id) {
            detail
        }
    }
`

const UPDATE_MUTATION = gql`
    mutation($id: ID!, $words: String!) {
        updateTodo(id: $id, words: $words) {
            detail
        }
    }
`

export default function() {
    const { loading, error, data } = useQuery(ALL_QUERY);

    const [ creating ] = useMutation(CREATE_MUTATION);
    const [ deleting ] = useMutation(DELETE_MUTATION);
    const [ updating ] = useMutation(UPDATE_MUTATION);

    const [ input, setInput ] = useState<string>('');
    const [ currentId, setCurrentId ] = useState<string>('');
    const [ processUpdating, setProcessUpdating ] = useState<boolean>(false);
    const [ loadings, setLoadings ] = useState<boolean>(false);

    const handleCreate = () => {
        if(input === '') {
            Swal.fire({
                icon: 'warning',
                title: '<p id="design">Cancelled</p>',
                text: `Message can't be blank!`,
                confirmButtonText: 'Retry'
            })
        }
        else {
            creating(
                {
                    variables: {
                        words: input                                       //assigned 'text'
                    },
                    refetchQueries: [{ query: ALL_QUERY }]
                }
            )
        }
    }

    const handleDelete = (thatId) => {
        deleting(
            {
                variables: {
                    id: thatId                                             //assigned 'id'
                },
                refetchQueries: [{ query: ALL_QUERY }]
            }
        )
    }

    const handleUpdate = (thatId, thatText) => {
        if(input === '') {
            Swal.fire({
                icon: 'warning',
                title: '<p id="design">Cancelled</p>',
                text: `Message can't be blank!`,
                confirmButtonText: 'Retry'
            })
        }
        else {
            updating(
                {
                    variables: {
                        id: thatId,                                        //assigned 'id'
                        words: thatText                                    //assigned 'id'
                    },
                    refetchQueries: [{ query: ALL_QUERY }]
                }
            )
        }
    }

    const processUpdate = (thatId, thatText) => {
        setProcessUpdating(true);
        setInput(thatText);
        setCurrentId(thatId);
    }

    const screen250 = useMediaQuery('(max-width:250px)');
    
    if(loading) return (
        <>
            <Head
            />

            <div className={style.root}>
                <Heading
                />
                
                <Card className={classnames(style.card, "bg-light")} square raised>
                    <Loading
                        sentence="Loading"
                    />

                    <div className={style.body}>
                        <div className="form-group">
                            <textarea autoFocus onChange={(e) => setInput(e.target.value)} value={input} className="form-control" id="exampleFormControlTextarea1" rows="6" className="form-control" placeholder="Enter a word . . ."></textarea>
                        </div>
    
                        <div className={style.btn}>
                            <Button onClick={!processUpdating ? () => handleCreate() : () => handleUpdate(currentId, input)} color="secondary" variant="contained" fullWidth size={screen250 ? "small" : "medium"}>
                                {!processUpdating ? `NEW MESSAGE` : `EDIT MESSAGE`}
                            </Button>
                        </div>
                    </div>
               </Card>
            </div>
        </>
    )
    
    if(error) return (
        <>
            <Head
            />

            <div className={style.err}>
                <Loading
                    sentence="Sorry, Error 404!"
                />
            </div>
        </>
    )

    return (
        <>
            <Head
            />

            <div className={style.root}>
                <Heading
                />
    
                <Card className={classnames(style.card, "bg-light")} square raised>
                    {
                        (data.allTodos.length !== 0) && (
                            <div className={style.base}>
                                <div className="form-group">
                                    <label htmlFor="exampleFormControlTextarea1">
                                        <h4> <span className="badge badge-warning badge-pill"> Todos </span> </h4>
                                    </label>
                                </div>
    
                                <table className="table table-borderless table-dark table-sm">
                                    <thead>
                                        {
                                            <tr>
                                                <th> # </th>
                                                <th> TODO </th>
                                                <th> ID </th>
                                                <th> EDIT </th>
                                                <th> REMOVE </th>
                                            </tr>
                                        }
                                    </thead>
                                    <tbody>
                                        {
                                            data.allTodos.map((obj, i) => (
                                                <tr key={obj.id}>
                                                    <th> {i + 1} </th>
                                                    {obj.detail.length < 10 ? <th className={style.text}> <span> {obj.detail} </span> </th> : <th className={style.text}> <span> { truncate(obj.detail, 10)} <ReadModal title={obj.id} notes={obj.detail}/> </span> </th>}
                                                    <th> {obj.id} </th>
                                                    <th> <IconButton onClick={() => processUpdate(obj.id, obj.detail) } color="inherit" size="small"> <EditIcon fontSize="small" style={{ color: 'golden' }}/> </IconButton> </th>
                                                    <th> <IconButton onClick={() => handleDelete(obj.id)} color="inherit" size="small"> <DeleteIcon fontSize="small" style={{ color: 'golden' }}/> </IconButton> </th>
                                                </tr>
                                            ))
                                        }
                                    </tbody>
                                </table>
                            </div>
                        )
                    }
    
                    <div className={style.body}>
                        <div className="form-group">
                            <textarea autoFocus onChange={(e) => setInput(e.target.value)} value={input} className="form-control" id="exampleFormControlTextarea1" rows="6" className="form-control" placeholder="Enter a word . . ."></textarea>
                        </div>
    
                        <div className={style.btn}>
                            <Button onClick={!processUpdating ? () => handleCreate() : () => handleUpdate(currentId, input)} color="secondary" variant="contained" fullWidth size={screen250 ? "small" : "medium"}>
                                {!processUpdating ? `NEW MESSAGE` : `EDIT MESSAGE`}
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        </>
    )
}