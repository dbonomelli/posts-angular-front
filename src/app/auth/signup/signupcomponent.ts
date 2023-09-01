import { Component, OnDestroy, OnInit } from "@angular/core";
import { NgForm } from "@angular/forms";
import { Subscription } from "rxjs";
import { AuthService } from "../auth.service";

@Component({
    templateUrl: './signup.component.html',
    styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit, OnDestroy {
    constructor(public authService: AuthService) {}

    isLoading = false;
    private authStatusSub: Subscription;

    ngOnInit(): void {
        this.authStatusSub = this.authService.getAuthStatusListener().subscribe(
            authStatus => {
                this.isLoading = false;
            }
        );
    }

    onSignUp(form: NgForm){
        if (form.invalid){
            return;
        }else{
            this.isLoading = true;
            this.authService.createUser(form.value.email, form.value.password);
        }
    }

    ngOnDestroy(): void {
        this.authStatusSub.unsubscribe();
    }
}