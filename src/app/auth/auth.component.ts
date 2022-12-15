import { Component, OnDestroy, ViewChild } from "@angular/core";
import { NgForm } from "@angular/forms";
import { Router } from "@angular/router";
import { Observable, Subscription } from "rxjs";
import { AlertComponent } from "../shared/alert/alert.component";
import { PlaceholderDirective } from "../shared/placeholder/placeholder.directive";
import { AuthResponseData, AuthService } from "./auth.service";

@Component({
	selector: 'app-auth',
	templateUrl: './auth.component.html'
})

export class AuthComponent implements OnDestroy {
	isLoginMode = true;
	isLoading = false;
	error: string = null;
	@ViewChild(PlaceholderDirective, { static: true }) alertHost: PlaceholderDirective;
	private closeSub: Subscription;

	constructor(private authService: AuthService, private router: Router) { }

	ngOnDestroy(): void {
		if (this.closeSub) this.closeSub.unsubscribe();
	}

	onSwitchMode() {
		this.isLoginMode = !this.isLoginMode;
	}


	private showErrorAlert(message: string) {
		const hostViewContainerRef = this.alertHost.viewContainerRef;
		hostViewContainerRef.clear();
		const componentRef = hostViewContainerRef.createComponent(AlertComponent);
		componentRef.instance.message = message;
		this.closeSub = componentRef.instance.close.subscribe(() => {
			this.closeSub.unsubscribe();
			hostViewContainerRef.clear();
		})
	}


	onSubmit(Form: NgForm) {

		if (!Form.valid) return;
		const email = Form.value.email;
		const password = Form.value.password;

		let authObs: Observable<AuthResponseData>;

		this.isLoading = true;
		switch (this.isLoginMode) {
			case true:
				authObs = this.authService.login(email, password);
				break;
			case false:
				authObs = this.authService.signup(email, password);
				break;
		}

		authObs.subscribe({
			next: (resData) => {
				console.log(resData);
				this.isLoading = false;
				this.router.navigate(['./recipes']);
			},
			error: (errorMessage) => {
				console.log(errorMessage);
				this.error = errorMessage;
				this.showErrorAlert(errorMessage);
				this.isLoading = false;
			}
		});

		Form.reset();
	}
}

