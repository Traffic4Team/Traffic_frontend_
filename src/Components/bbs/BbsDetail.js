// import axios from "axios";
// import React, { useEffect, useState, useContext } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { Link } from "react-router-dom";
// import CommentWrite from "../comment/CommentWrite";
// import CommentList from "../comment/CommentList";
// import { AuthContext } from "../context/AuthProvider";

// function BbsDetail() {
//     const { auth } = useContext(AuthContext);
//     const [bbs, setBbs] = useState({});
//     const { seq } = useParams();
//     const navigate = useNavigate();

//     const getBbsDetail = async () => {
//         try {
//             const resp = await axios.get(`/bbs/${seq}`, { params: { readerId: auth ? auth : "" } });
//             console.log("[BbsDetail.js] getBbsDetail() success :D");
//             console.log(resp.data);
//             setBbs(resp.data.bbs);
//         } catch (err) {
//             console.log("[BbsDetail.js] getBbsDetail() error :<");
//             console.log(err);
//         }
//     };

//     const deleteBbs = async () => {
//         try {
//             const resp = await axios.delete(`/bbs/${seq}`);
//             console.log("[BbsDetail.js] deleteBbs() success :D");
//             console.log(resp.data);

//             if (resp.data.deletedRecordCount === 1) {
//                 alert("게시글을 성공적으로 삭제했습니다 :D");
//                 navigate("/bbslist");
//             }
//         } catch (err) {
//             console.log("[BbsDetail.js] deleteBbs() error :<");
//             console.log(err);
//         }
//     };

//     useEffect(() => {
//         getBbsDetail();
//     }, []);

//     const updateBbs = {
//         seq: bbs.seq,
//         id: bbs.id,
//         title: bbs.title,
//         content: bbs.content
//     };

//     const parentBbs = {
//         id: bbs.id,
//         title: bbs.title
//     };

//     return (
//         <div>
//             <div className="my-3 d-flex justify-content-end">
//                 <Link className="btn btn-outline-secondary" to={{ pathname: `/bbsanswer/${bbs.seq}` }} state={{ parentBbs: parentBbs }}>
//                     <i className="fas fa-pen"></i> 답글쓰기
//                 </Link>{" "}
//                 &nbsp;
//                 {localStorage.getItem("id") === bbs.id ? (
//                     <>
//                         <Link className="btn btn-outline-secondary" to="/bbsupdate" state={{ bbs: updateBbs }}>
//                             <i className="fas fa-edit"></i> 수정
//                         </Link>{" "}
//                         &nbsp;
//                         <button className="btn btn-outline-danger" onClick={deleteBbs}>
//                             <i className="fas fa-trash-alt"></i> 삭제
//                         </button>
//                     </>
//                 ) : null}
//             </div>

//             <table className="table table-striped">
//                 <tbody>
//                     <tr>
//                         <th className="col-3">작성자</th>
//                         <td>
//                             <span>{bbs.id}</span>
//                         </td>
//                     </tr>
//                     <tr>
//                         <th>제목</th>
//                         <td>
//                             <span>{bbs.title}</span>
//                         </td>
//                     </tr>
//                     <tr>
//                         <th>작성일</th>
//                         <td>
//                             <span>{bbs.createdAt}</span>
//                         </td>
//                     </tr>
//                     <tr>
//                         <th>조회수</th>
//                         <td>
//                             <span>{bbs.readCount}</span>
//                         </td>
//                     </tr>
//                     <tr>
//                         <th>내용</th>
//                         <td>
//                             <div>{bbs.content}</div>
//                         </td>
//                     </tr>
//                 </tbody>
//             </table>

//             <div className="my-3 d-flex justify-content-center">
//                 <Link className="btn btn-outline-secondary" to="/bbslist">
//                     <i className="fas fa-list"></i> 글목록
//                 </Link>
//             </div>
//             <br /><br />

//             {auth ? <CommentWrite seq={seq} /> : null}

//             <CommentList seq={seq} />
//         </div>
//     );
// }

// export default BbsDetail;