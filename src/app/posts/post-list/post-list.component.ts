import { Component, OnDestroy, OnInit } from "@angular/core";
import { Post } from "../post.model";
import { PostsService } from "../posts.service";
import { Subscription } from "rxjs";
import { PageEvent } from "@angular/material/paginator";
import { AuthService } from "src/app/auth/auth.service";

@Component({
    selector: 'app-post-list',
    templateUrl: './post-list.component.html',
    styleUrls: ['./post-list.component.css']
})

export class PostListComponent implements OnInit, OnDestroy {
    posts: Post[] = [];
    isLoading = false;
    private postsSub: Subscription;
    totalPosts = 0;
    postsPerPage = 2;
    currentPage = 1;
    pageSizeOptions = [1, 2, 5, 10];
    userId:string;
    userIsAuthenticated = false;
    private authStatusSub: Subscription;

    constructor(public postsService: PostsService, private authService: AuthService) {}
    
    ngOnInit(): void {
        this.postsService.getPosts(this.postsPerPage, this.currentPage);
        this.isLoading = true;
        this.userId = this.authService.getUserId();
        this.postsSub = this.postsService.getPostUpdateListener().subscribe((postData: {posts: Post[], postCount: number})=>{
            this.isLoading = false; 
            this.posts = postData.posts; 
            this.totalPosts = postData.postCount;
            this.isLoading = false;
        });
        this.userIsAuthenticated = this.authService.getIsAuth();
        this.authStatusSub = this.authService.getAuthStatusListener().subscribe(isAuthenticated => {
            this.userIsAuthenticated = isAuthenticated;
            this.userId = this.authService.getUserId();
        });
    }

    ngOnDestroy(): void {
        this.authStatusSub.unsubscribe();
        this.postsSub.unsubscribe();
    }

    onDelete(postId: string){
        this.postsService.deletePost(postId).subscribe({
            next: ()=>{
                this.postsService.getPosts(this.postsPerPage, this.currentPage);
            },
            error: () => {
                this.isLoading = false;
            }
            
        });
    }

    onChangedPage(pageData: PageEvent){
        this.isLoading = true;
        this.currentPage = pageData.pageIndex + 1;
        this.postsPerPage = pageData.pageSize;
        this.postsService.getPosts(this.postsPerPage, this.currentPage);
    }
}