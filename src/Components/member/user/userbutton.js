import React from 'react';

function userbutton({ title, content, onClick  }) {
    return (
        <div className="container_userr" onClick={onClick}>
            <div className="text-container_user">
                <div className="title_user" title={title}>
                    <h4>{title}</h4>
                </div>
                <div className="content_user">
                    <h4 title={content}>{content}</h4>
                </div>
            </div>
        </div>
    );
}

export default userbutton;
