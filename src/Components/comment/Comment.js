import axios from "axios";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthProvider";
import { HttpHeadersContext } from "../context/HttpHeadersProvider";

function Comment(props) {
    const { headers} = useContext(HttpHeadersContext);
    const comment = props.obj;

    const navigate = useNavigate();

    const [show, setShow] = useState(false);
    const [content, setContent] = useState(comment.content);

    const changeContent = (event) => {
        setContent(event.target.value);
    };

    const updateComment = async () => {
        const req = {
            content: content
        };

        try {
            const resp = await axios.patch(`/comment/${comment.seq}`, req, { headers: headers });
            console.log("[Comment.js] updateComment() success :D");
            console.log(resp.data);
            alert("댓글을 성공적으로 수정했습니다 !");
            navigate(0);
            updateToggle();
        } catch (err) {
            console.log("[Comment.js] updateComment() error :<");
            console.log(err);
            alert(err.response.data);
        }
    };

    const deleteComment = async () => {
        try {
            const resp = await axios.delete(`/comment/${comment.seq}`);
            console.log("[BbsComment.js] deleteComment() success :D");
            console.log(resp.data);
            if (resp.data.deletedRecordCount === 1) {
                alert("답글을 성공적으로 삭제했습니다 :D");
                navigate(0);
            }
        } catch (err) {
            console.log("[BbsComment.js] deleteComment() error :<");
            console.log(err);
        }
    };

    function updateToggle() {
        setShow(show => !show);
    }

    if (comment.del === 0) {
        return (
            <>
                <div className="my-1 d-flex justify-content-center">
                    <div className="col-1">
                    </div>
                    <div className="col-5">
                        <div className="row">
                            <span className="comment-id">{comment.id}</span>
                        </div>
                        <div className="row">
                            <span>{comment.createdAt}</span>
                        </div>
                    </div>

                    <div className="col-4 d-flex justify-content-end">
                        {localStorage.getItem("id") === comment.id && (
                            <>
                                <button className="btn btn-outline-secondary" onClick={updateToggle}>
                                    <i className="fas fa-edit"></i> 수정
                                </button>{" "}
                                <button className="btn btn-outline-danger" onClick={deleteComment}>
                                    <i className="fas fa-trash-alt"></i> 삭제
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {show ? (
                    <>
                        <div className="my-3 d-flex justify-content-center">
                            <textarea className="col-10" rows="5" value={content} onChange={changeContent}></textarea>
                        </div>
                        <div className="my-1 d-flex justify-content-center">
                            <button className="btn btn-dark" onClick={updateComment}>
                                <i className="fas fa-edit"></i> 수정 완료
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="my-3 d-flex justify-content-center">
                            <div className="col-10 comment">{content}</div>
                        </div>
                    </>
                )}
            </>
        );
    } else {
        // 삭제된 댓글의 경우
        return (
            <>
                <div className="my-5 d-flex justify-content-center">
                    <div className="comment">
                        <span className="del-span">⚠️ 작성자에 의해 삭제된 댓글입니다.</span>
                    </div>
                </div>
            </>
        );
    }
}

export default Comment;

