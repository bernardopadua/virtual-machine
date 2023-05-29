import React from 'react';
import './style/top_message.css';

import TypeMessaging from '../core/messaging_constants';

export default function TopMessage({message, typemsg}){
    let classmsg = 'box-message-top';
    if(typemsg){
        switch (typemsg) {
            case TypeMessaging.GREEN:
                classmsg = classmsg + " box-message-top-green";
                break;
            case TypeMessaging.YELLOW:
                classmsg = classmsg + " box-message-top-yellow";
                break;
        
            default:
                break;
        }
    }
    
    if(message!=''){
        return (
            <div className={classmsg}>
                {message}
            </div>
        );
    } else {
        return;
    }
}