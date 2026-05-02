import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {providePrimeNG} from 'primeng/config';
import {definePreset} from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

// Recreates the PrimeNG v13 bootstrap4-dark-blue colour palette using v21's preset API.
// Source values extracted from primeng@13.0.3 resources/themes/bootstrap4-dark-blue/theme.css:
//   --surface-b: #20262e  (page bg)    --surface-a/e/f: #2a323d (cards/overlays)
//   --surface-d: #3f4b5b  (borders)    --text-color: rgba(255,255,255,0.87)
//   --primary-color: #8dd0ff            --primary-color-text: #151515
const Bootstrap4DarkBlue = definePreset(Aura, {
  primitive: {
    borderRadius: {
      md: '4px',
    },
  },
  semantic: {
    primary: {
      50: '#e8f4ff',
      100: '#c5e4ff',
      200: '#a3d4ff',
      300: '#8dd0ff',
      400: '#6bbcff',
      500: '#4aa9ff',
      600: '#2897f7',
      700: '#0075d6',
      800: '#0059a7',
      900: '#003d78',
      950: '#00214a',
    },
    colorScheme: {
      dark: {
        surface: {
          0:   '#ffffff',
          50:  '#f8f9fa',
          100: '#dee2e6',
          200: '#ced4da',
          300: '#adb5bd',
          400: '#909397',
          500: '#6c7289',
          600: '#495057',
          700: '#3f4b5b',
          800: '#2a323d',
          900: '#20262e',
          950: '#171c23',
        },
        primary: {
          color: '{primary.300}',
          contrastColor: '#151515',
          hoverColor: '{primary.200}',
          activeColor: '{primary.100}',
        },
        highlight: {
          background: '{primary.300}',
          focusBackground: '{primary.400}',
          color: '#151515',
          focusColor: '#151515',
        },
        mask: {
          background: 'rgba(0,0,0,0.4)',
          color: '{surface.200}',
        },
        formField: {
          background: '{surface.950}',
          disabledBackground: '{surface.700}',
          filledBackground: '{surface.900}',
          filledHoverBackground: '{surface.900}',
          filledFocusBackground: '{surface.900}',
          borderColor: '{surface.700}',
          hoverBorderColor: '{surface.600}',
          focusBorderColor: '{primary.color}',
          invalidBorderColor: '#f19ea6',
          color: 'rgba(255,255,255,0.87)',
          disabledColor: 'rgba(255,255,255,0.38)',
          placeholderColor: 'rgba(255,255,255,0.38)',
          invalidPlaceholderColor: '#f19ea6',
          floatLabelColor: 'rgba(255,255,255,0.38)',
          floatLabelFocusColor: '{primary.color}',
          floatLabelActiveColor: 'rgba(255,255,255,0.38)',
          floatLabelInvalidColor: '#f19ea6',
          iconColor: 'rgba(255,255,255,0.38)',
          shadow: 'none',
        },
        text: {
          color: 'rgba(255,255,255,0.87)',
          hoverColor: 'rgba(255,255,255,0.87)',
          mutedColor: 'rgba(255,255,255,0.6)',
          hoverMutedColor: 'rgba(255,255,255,0.7)',
        },
        content: {
          background: '{surface.800}',
          hoverBackground: 'rgba(255,255,255,0.04)',
          borderColor: '{surface.700}',
          color: '{text.color}',
          hoverColor: '{text.hover.color}',
        },
        overlay: {
          select: {
            background: '{surface.800}',
            borderColor: '{surface.700}',
            color: '{text.color}',
          },
          popover: {
            background: '{surface.800}',
            borderColor: '{surface.700}',
            color: '{text.color}',
          },
          modal: {
            background: '{surface.800}',
            borderColor: '{surface.700}',
            color: '{text.color}',
          },
        },
        list: {
          option: {
            focusBackground: 'rgba(255,255,255,0.04)',
            selectedBackground: '{primary.color}',
            selectedFocusBackground: '{primary.hover.color}',
            color: '{text.color}',
            focusColor: '{text.color}',
            selectedColor: '{primary.contrast.color}',
            selectedFocusColor: '{primary.contrast.color}',
            icon: {
              color: 'rgba(255,255,255,0.38)',
              focusColor: 'rgba(255,255,255,0.6)',
            },
          },
          optionGroup: {
            background: 'transparent',
            color: '{text.muted.color}',
          },
        },
        navigation: {
          item: {
            focusBackground: 'rgba(255,255,255,0.04)',
            activeBackground: 'rgba(255,255,255,0.04)',
            color: '{text.color}',
            focusColor: '{text.color}',
            activeColor: '{text.color}',
            icon: {
              color: 'rgba(255,255,255,0.38)',
              focusColor: 'rgba(255,255,255,0.6)',
              activeColor: 'rgba(255,255,255,0.6)',
            },
          },
          submenuLabel: {
            background: 'transparent',
            color: '{text.muted.color}',
          },
          submenuIcon: {
            color: 'rgba(255,255,255,0.38)',
            focusColor: 'rgba(255,255,255,0.6)',
            activeColor: 'rgba(255,255,255,0.6)',
          },
        },
      },
    },
  },
});

import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {TorrentStateComponent} from './components/torrent-state/torrent-state.component';
import {TorrentComponent} from './components/torrent/torrent.component';
import {ProgressBarModule} from 'primeng/progressbar';
import {NgxFilesizeModule} from 'ngx-filesize';
import {ButtonModule} from 'primeng/button';
import {RippleModule} from 'primeng/ripple';
import {TooltipModule} from 'primeng/tooltip';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {ApiInterceptor, AuthInterceptor} from './api.service';
import {SelectModule} from 'primeng/select';
import {OrderByPipe} from './order-by.pipe';
import {FormsModule} from '@angular/forms';
import {PopoverModule} from 'primeng/popover';
import {DeleteTorrentOverlayComponent} from './components/delete-torrent-overlay/delete-torrent-overlay.component';
import {ProgressSpinnerModule} from 'primeng/progressspinner';
import {MomentModule} from 'ngx-moment';
import {MenuModule} from 'primeng/menu';
import {AddTorrentMenuComponent} from './components/add-torrent-menu/add-torrent-menu.component';
import {DialogService, DynamicDialogModule} from 'primeng/dynamicdialog';
import {
  AddTorrentMagnetInputComponent
} from './components/add-torrent-menu/add-torrent-magnet-input/add-torrent-magnet-input.component';
import {InputTextModule} from 'primeng/inputtext';
import {AddTorrentConfigComponent} from './components/add-torrent-menu/add-torrent-config/add-torrent-config.component';
import {AccordionModule} from 'primeng/accordion';
import {InputNumberModule} from 'primeng/inputnumber';
import {CheckboxModule} from 'primeng/checkbox';
import {TorrentDetailsDialogComponent} from './components/torrent-details-dialog/torrent-details-dialog.component';
import {
  AddTorrentUrlInputComponent
} from './components/add-torrent-menu/add-torrent-url-input/add-torrent-url-input.component';
import {MessageModule} from 'primeng/message';
import {
  AddTorrentFileInputComponent
} from './components/add-torrent-menu/add-torrent-file-input/add-torrent-file-input.component';
import {FileUploadModule} from 'primeng/fileupload';
import {BreakpointOverlayComponent} from './components/breakpoint-overlay/breakpoint-overlay.component';
import {TorrentSearchPipe} from './torrent-search.pipe';
import {ConnectivityStatusComponent} from './components/connectivity-status/connectivity-status.component';
import {TorrentSearchComponent} from './components/torrent-search/torrent-search.component';
import {ENVIRONMENT} from './environment';
import {TorrentLabelComponent} from './components/torrent-label/torrent-label.component';
import {
  TorrentEditLabelDialogComponent
} from './components/torrent-edit-label-dialog/torrent-edit-label-dialog.component';
import {PluginEnableComponent} from './components/plugin-enable/plugin-enable.component';
import {MultiSelectModule} from 'primeng/multiselect';
import { ActivityMarkerComponent } from './components/activity-marker/activity-marker.component';
import { ApiKeyDialogComponent } from './components/api-key-dialog/api-key-dialog.component';
import { SessionStatusComponent } from './components/session-status/session-status.component';

// @ts-ignore
@NgModule({
  declarations: [
    AppComponent,
    TorrentStateComponent,
    TorrentComponent,
    OrderByPipe,
    DeleteTorrentOverlayComponent,
    AddTorrentMenuComponent,
    AddTorrentMagnetInputComponent,
    AddTorrentConfigComponent,
    TorrentDetailsDialogComponent,
    AddTorrentUrlInputComponent,
    AddTorrentFileInputComponent,
    BreakpointOverlayComponent,
    TorrentSearchPipe,
    ConnectivityStatusComponent,
    TorrentSearchComponent,
    TorrentLabelComponent,
    TorrentEditLabelDialogComponent,
    PluginEnableComponent,
    ActivityMarkerComponent,
    ApiKeyDialogComponent,
    SessionStatusComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,

    NgxFilesizeModule,
    ProgressBarModule,
    MenuModule,
    ButtonModule,
    RippleModule,
    TooltipModule,
    SelectModule,
    FormsModule,
    PopoverModule,
    ProgressSpinnerModule,
    DynamicDialogModule,
    MomentModule,
    InputTextModule,
    AccordionModule,
    InputNumberModule,
    CheckboxModule,
    MessageModule,
    FileUploadModule,
    MultiSelectModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ApiInterceptor,
      multi: true,
    },
    {
      provide: ENVIRONMENT,
      // @ts-ignore
      // Environment injection is handled by the server.
      // It will replace the contents of the initializer in index.html with the environment
      // specific variables on-demand.
      useValue: window.environment,
    },
    DialogService,
    providePrimeNG({
      theme: {
        preset: Bootstrap4DarkBlue,
        options: { darkModeSelector: '.p-dark' }
      }
    }),
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
