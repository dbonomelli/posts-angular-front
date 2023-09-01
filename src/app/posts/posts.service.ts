import { Post } from "./post.model";
import {HttpClient} from '@angular/common/http'
import { Subject } from "rxjs";
import { Injectable } from "@angular/core";
import { map } from "rxjs/operators"
import { Router } from "@angular/router";
import { environment } from '../../environments/environments.prod'

const BACKEND_URL_POSTS = environment.apiUrl + "posts/";

@Injectable({ providedIn: "root"})
export class PostsService{
    private posts: Post[] = [];
    private postsUpdated = new Subject<{posts: Post[], postCount: number}>();
    

    constructor(private http: HttpClient, private router: Router){}


    getPosts(postPerPage: number, currentPage: number){
        const queryParams = `?pagesize=${postPerPage}&page=${currentPage}`;
        this.http.get<{message: string, posts: any, maxPosts: number}>(BACKEND_URL_POSTS + queryParams)
        .pipe(map((postData) => {
            return { posts: postData.posts.map(post => {
                return { 
                    title: post.title, 
                    content: post.content, 
                    id: post._id, 
                    imagePath: post.imagePath,
                    creator: post.creator,
                };
            }), 
            maxPosts: postData.maxPosts
        };
        })
        )
        .subscribe((transoformedPostData) => {
            this.posts = transoformedPostData.posts;
            this.postsUpdated.next({posts: [...this.posts], postCount: transoformedPostData.maxPosts});
        });
    }

    getPostUpdateListener(){
        return this.postsUpdated.asObservable();
    }

    getPost(id: string){
        return this.http.get<{_id: string, title: string, content: string, imagePath: File | String, creator: string}>(BACKEND_URL_POSTS + id);
    }

    addPost(title: string, content: string, image: File){
        const postData = new FormData();
        postData.append('title', title);
        postData.append('content', content);
        postData.append('image', image, title);
        this.http.post<{post: Post, message: string}>(BACKEND_URL_POSTS, postData).subscribe((responseData)=>{
            this.router.navigate(['/']);
        });

    }

    updatePost(postId: string, title: string, content: string, image: File | string){
        let postData: Post | FormData;
        if (typeof image === 'object'){
            postData = new FormData();
            postData.append('id', postId);
            postData.append('title', title);
            postData.append('content', content);
            postData.append('image', image, title);
        }else{
            postData = {id: postId, title: title, content: content, imagePath: image, creator: null}
        }


        this.http.put(BACKEND_URL_POSTS + postId, postData).subscribe(response => {
            this.router.navigate(['/']);
        });
    }

    deletePost(postId: string){
        return this.http.delete(BACKEND_URL_POSTS + postId);
    }
}