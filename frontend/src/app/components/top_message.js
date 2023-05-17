import React from 'react';
import './style/top_message.css';

export default function TopMessage({message}){
    if(message!=''){
        return (
            <div className='box-message-top'>
                {message}
            </div>
        );
    } else {
        return;
    }
}